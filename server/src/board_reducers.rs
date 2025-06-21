use spacetimedb::Table;
use spacetimedb::{reducer, ReducerContext};

use crate::{board, message, pixel, user};
use crate::{Board, User};

fn validate_name(name: &str) -> bool {
    // Check if the name is empty or too long
    !name.is_empty() && name.len() <= 50
}

fn validate_colors(colors: &[String]) -> bool {
    // Check if colors are valid hex codes and not empty
    !colors.is_empty()
        && colors.iter().all(|color| {
            color.starts_with('#')
                && color.len() == 7
                && u32::from_str_radix(&color[1..], 16).is_ok()
        })
}

#[reducer]
pub fn create_board(ctx: &ReducerContext, name: String, colors: Vec<String>) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        if user.admin {
            // Validate board name and colors
            if validate_name(&name) && validate_colors(&colors) {
                // Insert the new board into the database
                ctx.db.board().insert(Board {
                    id: 0,
                    name: name,
                    colors: colors,
                    identity: ctx.sender,
                    created_at: ctx.timestamp,
                });
            } else {
                log::warn!(
                    "Invalid board name or colors provided by user {}",
                    ctx.sender
                );
            }
        } else {
            log::warn!(
                "User {} attempted to create a board without admin privileges",
                ctx.sender
            );
        }
    }
}

#[reducer]
pub fn join_board(ctx: &ReducerContext, board_id: u32) {
    if let Some(board) = ctx.db.board().id().find(board_id) {
        if let Some(mut user) = ctx.db.user().identity().find(ctx.sender) {
            // Set color to first color of the board if invalid
            // Else, use current color
            if user.current_color.is_none()
                || !board.colors.contains(&user.current_color.clone().unwrap())
            {
                user.current_color = board.colors.first().cloned();
            }

            // Update user's current board
            user.current_board = Some(board_id);
            ctx.db.user().identity().update(user);
        } else {
            // Handle case where user does not exist
            log::warn!(
                "Attempted to join board without a valid user: {}",
                ctx.sender
            );
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
        log::warn!(
            "Attempted to leave board without a valid user: {}",
            ctx.sender
        );
    }
}

#[reducer]
pub fn clear_board(ctx: &ReducerContext) {
    // Get user's current board
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        if let Some(board_id) = user.current_board {
            // Ensure we are admin
            if user.admin {
                // Clear all pixels and messages for the board
                ctx.db.pixel().board_id().delete(board_id);
                ctx.db.message().board_id().delete(board_id);

                log::info!("Board {} cleared by user {}", board_id, ctx.sender);
            } else {
                log::warn!(
                    "User {} attempted to clear board {} without admin privileges",
                    ctx.sender,
                    board_id
                );
            }
        } else {
            log::warn!(
                "User {} attempted to clear a board without being in one",
                ctx.sender
            );
        }
    } else {
        log::warn!(
            "Attempted to clear board without a valid user: {}",
            ctx.sender
        );
    }
}
