import { useEffect, useState } from "react";
import { useAppContext } from "../context/app";
import type { Board, EventContext } from "../../module_bindings";

export function useBoards() {
  const { conn, connected, addQueries, removeQueries } = useAppContext();
  const [boards, setBoards] = useState<Map<string, Board>>(new Map());

  useEffect(() => {
    if (!conn || !connected) return;
    addQueries(["SELECT * FROM board"]);

    const onInsert = (_ctx: EventContext, board: Board) => {
      setBoards((prev) => new Map(prev.set(board.id.toString(), board)));
    };
    conn.db.board.onInsert(onInsert);

    const onUpdate = (_ctx: EventContext, oldBoard: Board, newBoard: Board) => {
      setBoards((prev) => {
        prev.delete(oldBoard.id.toString());
        return new Map(prev.set(newBoard.id.toString(), newBoard));
      });
    };
    conn.db.board.onUpdate(onUpdate);

    const onDelete = (_ctx: EventContext, board: Board) => {
      setBoards((prev) => {
        prev.delete(board.id.toString());
        return new Map(prev);
      });
    };
    conn.db.board.onDelete(onDelete);

    return () => {
      conn.db.board.removeOnInsert(onInsert);
      conn.db.board.removeOnUpdate(onUpdate);
      conn.db.board.removeOnDelete(onDelete);
      removeQueries(["SELECT * FROM board"]);
    };
  }, [conn, connected]);

  return boards;
}
