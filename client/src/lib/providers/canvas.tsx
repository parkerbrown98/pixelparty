import { useEffect, useState } from "react";
import { CanvasContext } from "../context/canvas";
import type { EventContext, Message, Pixel } from "../../module_bindings";
import { useUsers } from "../context/user";
import { useAppContext } from "../context/app";

export default function CanvasProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { conn, boards, addSubscription, clearSubscriptions } =
        useAppContext();
    const { ourUser, users } = useUsers();
    const [messages, setMessages] = useState<Message[]>([]);
    const [pixels, setPixels] = useState<Map<string, Pixel>>(new Map());
    const [chatEnabled, setChatEnabled] = useState(true);
    const [gridEnabled, setGridEnabled] = useState(true);

    const canvasId = ourUser?.currentBoard ?? null;
    const canvasUsers = users.filter((u) => u.currentBoard === canvasId);
    const board = boards.find((b) => b.id === canvasId);
    const availableColors = board?.colors ?? [];

    // Manage subscriptions to messages & pixels
    useEffect(() => {
        if (!conn || canvasId === null) return;

        // Clear previous subscriptions when canvasId or connection changes
        clearSubscriptions("canvas");

        // Subscribe to message and pixel events
        const handle = addSubscription("canvas", [
            `SELECT * FROM message WHERE board_id = '${canvasId}'`,
            `SELECT * FROM pixel WHERE board_id = '${canvasId}'`,
        ]);
        // Register row-level event handlers
        if (handle) {
            const onMsgInsert = (_ctx: EventContext, m: Message) =>
                setMessages((prev) => [...prev, m]);
            const onMsgUpdate = (
                _: EventContext,
                oldM: Message,
                newM: Message
            ) =>
                setMessages((prev) =>
                    prev.map((m) => (m.id === oldM.id ? newM : m))
                );
            const onMsgDel = (_: EventContext, m: Message) =>
                setMessages((prev) => prev.filter((x) => x.id !== m.id));

            const onPxInsert = (_ctx: EventContext, p: Pixel) => {
                setPixels((prev) => {
                    const map = new Map(prev);
                    const key = `${p.x},${p.y}`;
                    if (!p.color) {
                        map.delete(key);
                    } else {
                        map.set(key, p);
                    }

                    return map;
                });
            };

            const onPxUpdate = (_: EventContext, oldP: Pixel, newP: Pixel) => {
                setPixels((prev) => {
                    const map = new Map(prev);
                    const key = `${oldP.x},${oldP.y}`;
                    if (!newP.color) {
                        map.delete(key);
                    } else {
                        map.set(`${newP.x},${newP.y}`, newP);
                        if (key !== `${newP.x},${newP.y}`) {
                            map.delete(key);
                        }
                    }
                    return map;
                });
            };

            const onPxDel = (_: EventContext, p: Pixel) => {
                setPixels((prev) => {
                    const map = new Map(prev);
                    map.delete(`${p.x},${p.y}`);
                    return map;
                });
            };

            // Register handlers
            conn.db.message.onInsert(onMsgInsert);
            conn.db.message.onUpdate(onMsgUpdate);
            conn.db.message.onDelete(onMsgDel);
            conn.db.pixel.onInsert(onPxInsert);
            conn.db.pixel.onUpdate(onPxUpdate);
            conn.db.pixel.onDelete(onPxDel);

            return () => {
                clearSubscriptions("canvas");
                conn.db.message.removeOnInsert(onMsgInsert);
                conn.db.message.removeOnUpdate(onMsgUpdate);
                conn.db.message.removeOnDelete(onMsgDel);
                conn.db.pixel.removeOnInsert(onPxInsert);
                conn.db.pixel.removeOnUpdate(onPxUpdate);
                conn.db.pixel.removeOnDelete(onPxDel);
            };
        }
    }, [conn, canvasId, addSubscription, clearSubscriptions]);

    const paint = (x: number, y: number) => {
        if (!conn || canvasId === null) return;
        conn.reducers.addPixel(x, y);
    };

    const erase = (x: number, y: number) => {
        if (!conn || canvasId === null) return;
        conn.reducers.erasePixel(x, y);
    };

    const sendMessage = (text: string) => {
        if (!conn || canvasId === null) return;
        conn.reducers.sendMessage(text);
    };

    return (
        <CanvasContext.Provider
            value={{
                canvasId,
                messages,
                users: canvasUsers,
                pixels,
                availableColors,
                paint,
                erase,
                sendMessage,
                chatEnabled,
                setChatEnabled,
                gridEnabled,
                setGridEnabled,
            }}
        >
            {children}
        </CanvasContext.Provider>
    );
}
