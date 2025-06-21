use spacetimedb::{reducer, ReducerContext};

use crate::{board, user, User};

fn validate_name(name: &str) -> bool {
    // Simple validation: name must be non-empty and less than 50 characters
    !name.is_empty() && name.len() <= 50
}

fn validate_color(color: &str) -> bool {
    // Simple validation: color must be a valid hex code
    color.starts_with('#') && color.len() == 7 && u32::from_str_radix(&color[1..], 16).is_ok()
}

#[reducer]
pub fn set_name(ctx: &ReducerContext, name: String) -> Result<(), String> {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        if validate_name(&name) {
            ctx.db.user().identity().update(User {
                name: Some(name),
                ..user
            });
            Ok(())
        } else {
            // Handle invalid name
            Err("Invalid name provided".to_string())
        }
    } else {
        // Handle case where user does not exist
        log::warn!(
            "Attempted to set name for non-existent user: {}",
            ctx.sender
        );
        Err("User not found".to_string())
    }
}

#[reducer]
pub fn set_color(ctx: &ReducerContext, color: String) -> Result<(), String> {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        if validate_color(&color) && user.current_board.is_some() {
            let board_id = user.current_board.unwrap();
            if let Some(board) = ctx.db.board().id().find(board_id) {
                // Check if color is in the board's color palette
                if board.colors.contains(&color) {
                    ctx.db.user().identity().update(User {
                        current_color: Some(color),
                        ..user
                    });
                    Ok(())
                } else {
                    // Handle case where color is not in the board's palette
                    Err("Color not found in the board's color palette".to_string())
                }
            }
            // Handle case where board is not found
            else {
                log::warn!(
                    "Attempted to set color for user {} on non-existent board: {}",
                    ctx.sender,
                    board_id
                );
                Err("Board not found".to_string())
            }
        } else {
            // Handle invalid color or no current board
            Err("Invalid color or no current board set".to_string())
        }
    } else {
        // Handle case where user does not exist
        log::warn!(
            "Attempted to set color for non-existent user: {}",
            ctx.sender
        );
        Err("User not found".to_string())
    }
}
