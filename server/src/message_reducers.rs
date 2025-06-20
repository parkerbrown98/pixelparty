use spacetimedb::Table;
use spacetimedb::{reducer, ReducerContext};

use crate::{message, user};
use crate::Message;

#[reducer]
pub fn send_message(ctx: &ReducerContext, content: String) {
    // Make sure we're in the board
    if let Some(board_id) = ctx.db.user().identity().find(ctx.sender).and_then(|user| user.current_board) {
        ctx.db.message().insert(Message {
            id: 0, // Auto-incremented by the database
            board_id,
            content,
            identity: ctx.sender,
            created_at: ctx.timestamp,
        });
    } else {
        // Handle case where user is not in a board
        log::warn!("User {} attempted to send a message without being in a board", ctx.sender);
    }
}