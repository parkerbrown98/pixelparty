use spacetimedb::Table;
use spacetimedb::{reducer, ReducerContext};

use crate::{pixel, Pixel};
use crate::user;

#[reducer]
pub fn add_pixel(ctx: &ReducerContext, x: u32, y: u32, color: String) {
    // Make sure we're in a board
    if let Some(board_id) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.pixel().insert(Pixel {
            id: 0, // Auto-incremented by the database
            board_id: 0,
            x,
            y,
            color,
            identity: ctx.sender,
            created_at: ctx.timestamp,
        });
    } else {
        // Handle case where user is not in a board
        log::warn!("User {} attempted to add a pixel without being in a board", ctx.sender);
    }
}