use spacetimedb::{reducer, table, Identity, ReducerContext, Table, Timestamp};

mod board_reducers;
mod message_reducers;
mod pixel_reducers;

#[table(name = user, public)]
pub struct User {
    #[primary_key]
    identity: Identity,
    name: Option<String>,
    online: bool,
    current_board: Option<u32>,
}

#[table(name = board, public)]
pub struct Board {
    #[primary_key]
    #[auto_inc]
    id: u32,
    name: String,
    #[index(btree)]
    identity: Identity,
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
    color: String,
    #[index(btree)]
    identity: Identity,
    created_at: Timestamp,
}

#[reducer(client_connected)]
pub fn client_connected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User {
            online: true,
            ..user
        });
    } else {
        ctx.db.user().insert(User {
            identity: ctx.sender,
            name: None,
            online: true,
            current_board: None,
        });
    }
}

#[reducer(client_disconnected)]
pub fn client_disconnected(ctx: &ReducerContext) {
    if let Some(user) = ctx.db.user().identity().find(ctx.sender) {
        ctx.db.user().identity().update(User {
            // online: false,
            // current_board: None,
            ..user
        });
    }
}
