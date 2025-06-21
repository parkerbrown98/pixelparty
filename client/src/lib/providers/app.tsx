import { useEffect, useState } from "react";
import { AppContext } from "../context/app";
import { useSpacetimeDb } from "../hooks/spacetimedb";
import type { Board } from "../../module_bindings";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const { conn, identity, connected, addSubscription, clearSubscriptions } = useSpacetimeDb();
    const [boards, setBoards] = useState<Board[]>([]);

    useEffect(() => {
        if (!conn) return;

        const onInsert = (_ctx: any, board: Board) => {
            setBoards((prev) => [...prev, board]);
        };
        conn.db.board.onInsert(onInsert);

        const onUpdate = (_ctx: any, oldBoard: Board, newBoard: Board) => {
            setBoards((prev) =>
                prev.map((b) => (b.id === oldBoard.id ? newBoard : b))
            );
        };
        conn.db.board.onUpdate(onUpdate);

        const onDelete = (_ctx: any, board: Board) => {
            setBoards((prev) => prev.filter((b) => b.id !== board.id));
        };
        conn.db.board.onDelete(onDelete);

        return () => {
            conn.db.board.removeOnInsert(onInsert);
            conn.db.board.removeOnUpdate(onUpdate);
            conn.db.board.removeOnDelete(onDelete);
        };
    }, [conn]);

    const createBoard = (name: string, colors: string[]) => {
        if (!conn) return;
        if (colors.length <= 1) {
            console.error(
                "At least two colors are required to create a board."
            );
            return;
        }

        if (name.trim() === "") {
            console.error("Board name cannot be empty.");
            return;
        }

        if (colors.length < 2) {
            console.error(
                "At least two colors are required to create a board."
            );
            return;
        }

        // Validate color format
        const colorRegex = /^#[0-9A-Fa-f]{6}$/;
        for (const color of colors) {
            if (!colorRegex.test(color)) {
                console.error(`Invalid color format: ${color}`);
                return;
            }
        }

        conn.reducers.createBoard(name, colors);
    };

    const clearCurrentBoard = () => {
        if (!conn) return;
        conn.reducers.clearBoard();
    };

    const joinBoard = (boardId: number) => {
        if (!conn) return;
        conn.reducers.joinBoard(boardId);
    };

    return (
        <AppContext.Provider
            value={{
                identity,
                conn,
                connected,
                boards,
                createBoard,
                clearCurrentBoard,
                joinBoard,
                addSubscription,
                clearSubscriptions,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
