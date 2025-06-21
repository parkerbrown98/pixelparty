use spacetimedb::Table;
use spacetimedb::{reducer, ReducerContext};

use crate::Message;
use crate::{message, user};

#[reducer]
pub fn send_message(ctx: &ReducerContext, content: String) {
    // Make sure we're in the board
    if let Some(board_id) = ctx
        .db
        .user()
        .identity()
        .find(ctx.sender)
        .and_then(|user| user.current_board)
    {
        ctx.db.message().insert(Message {
            id: 0, // Auto-incremented by the database
            board_id,
            content,
            identity: ctx.sender,
            created_at: ctx.timestamp,
        });
    } else {
        // Handle case where user is not in a board
        log::warn!(
            "User {} attempted to send a message without being in a board",
            ctx.sender
        );
    }
}

#[reducer]
pub fn delete_message(ctx: &ReducerContext, message_id: u32) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        if let Some(message) = ctx.db.message().id().find(message_id) {
            // Only allow deletion if the user is the author of the message
            if message.identity == ctx.sender || user.admin {
                ctx.db.message().id().delete(message_id);
            } else {
                log::warn!(
                    "User {} attempted to delete a message they did not author: {}",
                    ctx.sender,
                    message_id
                );
            }
        } else {
            log::warn!("Attempted to delete non-existent message: {}", message_id);
        }
    } else {
        log::warn!(
            "Attempted to delete message without a valid user: {}",
            ctx.sender
        );
    }
}
