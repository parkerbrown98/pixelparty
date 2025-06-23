use spacetimedb::{reducer, table, Identity, ReducerContext, SpacetimeType, Table, Timestamp};

mod board_reducers;
mod message_reducers;
mod pixel_reducers;
mod user_reducers;

#[derive(SpacetimeType, Debug, PartialEq)]
pub enum ToolType {
    Brush = 0,
    Eraser = 1,
}

#[table(name = user, public)]
pub struct User {
    #[primary_key]
    identity: Identity,
    name: Option<String>,
    online: bool,
    current_board: Option<u32>,
    current_color: Option<String>,
    current_tool: ToolType,
    admin: bool,
    created_at: Timestamp,
}

#[table(name = board, public)]
pub struct Board {
    #[primary_key]
    #[auto_inc]
    id: u32,
    name: String,
    #[index(btree)]
    identity: Identity,
    colors: Vec<String>,
    created_at: Timestamp,
}

#[table(name = message, public)]
pub struct Message {
    #[primary_key]
    #[auto_inc]
    id: u32,
    #[index(btree)]
    board_id: u32,
    content: String,
    #[index(btree)]
    identity: Identity,
    created_at: Timestamp,
}

#[table(name = pixel, public)]
pub struct Pixel {
    #[primary_key]
    #[auto_inc]
    id: u64,
    #[index(btree)]
    board_id: u32,
    x: u32,
    y: u32,
    color: Option<String>,
    #[index(btree)]
    identity: Identity,
    created_at: Timestamp,
}

#[reducer(client_connected)]
pub fn client_connected(ctx: &ReducerContext) {
    if let Some(mut user) = ctx.db.user().identity().find(ctx.sender) {
        // Handle non-existent board
        if let Some(board_id) = user.current_board {
            if ctx.db.board().id().find(board_id).is_none() {
                user.current_board = None; // Reset to None if board does not exist
                user.current_color = None; // Reset color as well
            }
        }

        user.online = true;
        ctx.db.user().identity().update(user);
    } else {
        let is_first_user = ctx.db.user().count() == 0;
        ctx.db.user().insert(User {
            identity: ctx.sender,
            name: None,
            online: true,
            current_board: None,
            current_color: None,
            current_tool: ToolType::Brush,
            admin: is_first_user, // First user is admin
            created_at: ctx.timestamp,
        });
    }
}

#[reducer(client_disconnected)]
pub fn client_disconnected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User {
            online: false,
            current_board: None,
            ..user
        });
    }
}
