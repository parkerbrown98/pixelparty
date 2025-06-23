use spacetimedb::Table;
use spacetimedb::{reducer, ReducerContext};

use crate::{board, pixel, Pixel};
use crate::{user, ToolType};

#[reducer]
pub fn add_pixel(ctx: &ReducerContext, x: u32, y: u32) {
    // Make sure we're in a board
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        if let Some(board_id) = user.current_board {
            // Ensure the user has a current color belonging to the board colors
            if let Some(color) = user.current_color {
                if let Some(board) = ctx.db.board().id().find(board_id) {
                    if board.colors.contains(&color) {
                        ctx.db.pixel().insert(Pixel {
                            id: 0, // Auto-incremented by the database
                            board_id: board.id,
                            x,
                            y,
                            color: Some(color),
                            identity: ctx.sender,
                            created_at: ctx.timestamp,
                        });
                    } else {
                        log::warn!(
                            "User {} attempted to add pixel with invalid color: {}",
                            ctx.sender,
                            color
                        );
                    }
                } else {
                    log::warn!("Attempted to add pixel to non-existent board: {}", board_id);
                }
            } else {
                log::warn!("User {} has no current color set", ctx.sender);
            }
        } else {
            log::warn!("User {} is not in any board", ctx.sender);
        }
    } else {
        log::warn!(
            "Attempted to add pixel without a valid user: {}",
            ctx.sender
        );
    }
}

#[reducer]
pub fn erase_pixel(ctx: &ReducerContext, x: u32, y: u32) {
    // Make sure we're in a board
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        if user.current_tool != ToolType::Eraser {
            log::warn!(
                "User {} attempted to erase pixel with non-eraser tool: {:?}",
                ctx.sender,
                user.current_tool
            );
            return;
        }
        if let Some(board_id) = user.current_board {
            ctx.db.pixel().insert(Pixel {
                id: 0, // Auto-incremented by the database
                board_id: board_id,
                x,
                y,
                color: None, // Set color to None to indicate erasure
                identity: ctx.sender,
                created_at: ctx.timestamp,
            });
        } else {
            log::warn!("User {} is not in any board", ctx.sender);
        }
    } else {
        log::warn!(
            "Attempted to erase pixel without a valid user: {}",
            ctx.sender
        );
    }
}
