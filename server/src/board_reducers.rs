use spacetimedb::Table;
use spacetimedb::{reducer, ReducerContext};

use crate::{Board, User};
use crate::{board, pixel, message, user};

#[reducer]
pub fn create_board(ctx: &ReducerContext, name: String) {
    ctx.db.board().insert(Board {
        id: 0, // Auto-incremented by the database
        name,
        identity: ctx.sender,
        created_at: ctx.timestamp,
    });
}

#[reducer]
pub fn join_board(ctx: &ReducerContext, board_id: u32) {
    if let Some(_) = ctx.db.board().id().find(board_id) {
        if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
            ctx.db.user().identity().update(User {
                current_board: Some(board_id),
                ..user
            });
        } else {
            // Handle case where user does not exist
            log::warn!("Attempted to join board without a valid user: {}", ctx.sender);
        }
    } else {
        // Handle case where board does not exist
        log::warn!("Attempted to join non-existent board: {}", board_id);
    }
}

#[reducer]
pub fn leave_board(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User {
            current_board: None,
            ..user
        });
    } else {
        // Handle case where user does not exist
        log::warn!("Attempted to leave board without a valid user: {}", ctx.sender);
    }
}

#[reducer]
pub fn clear_board(ctx: &ReducerContext) {
    // Get user's current board
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        if let Some(board_id) = user.current_board {
            // Ensure we own the board
            if let Some(board) = ctx.db.board().id().find(board_id) {
                if board.identity == ctx.sender {
                    // Clear the board by deleting all pixels and messages
                    ctx.db.pixel().board_id().delete(board_id);
                    ctx.db.message().board_id().delete(board_id);
                    log::info!("Board {} cleared by user {}", board_id, ctx.sender);
                } else {
                    log::warn!("User {} attempted to clear board {} they do not own", ctx.sender, board_id);
                }
            } else {
                log::warn!("Attempted to clear non-existent board: {}", board_id);
            }
        } else {
            log::warn!("User {} attempted to clear a board without being in one", ctx.sender);
        }
    } else {
        log::warn!("Attempted to clear board without a valid user: {}", ctx.sender);
    }
}