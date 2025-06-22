import { useEffect, useState } from "react";
import type { ToolType, User } from "../../module_bindings";
import { useAppContext } from "../context/app";
import { UserContext } from "../context/user";

export default function UserProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { conn, identity } = useAppContext();
    const [users, setUsers] = useState<User[]>([]);
    const ourUser = users.find(
        (user) => user.identity.toHexString() === identity?.toHexString()
    );

    useEffect(() => {
        if (!conn) return;

        const onInsert = (_ctx: any, user: User) => {
            setUsers((prev) => [...prev, user]);
        };
        conn.db.user.onInsert(onInsert);

        const onUpdate = (_ctx: any, oldUser: User, newUser: User) => {
            setUsers((prev) =>
                prev.map((u) =>
                    u.identity.toHexString() === oldUser.identity.toHexString()
                        ? newUser
                        : u
                )
            );
        };
        conn.db.user.onUpdate(onUpdate);

        const onDelete = (_ctx: any, user: User) => {
            setUsers((prev) =>
                prev.filter(
                    (u) =>
                        u.identity.toHexString() !== user.identity.toHexString()
                )
            );
        };
        conn.db.user.onDelete(onDelete);

        return () => {
            conn.db.user.removeOnInsert(onInsert);
            conn.db.user.removeOnUpdate(onUpdate);
            conn.db.user.removeOnDelete(onDelete);
        };
    }, [conn]);

    const setUserName = (name: string) => {
        if (!conn || !ourUser) return;
        if (name.trim() === "") return;
        if (name.length > 50) {
            console.warn("Username is too long, truncating to 50 characters.");
            name = name.slice(0, 50);
        }

        conn.reducers.setName(name);
    };

    const setTool = (tool: ToolType) => {
        if (!conn || !ourUser) return;
        conn.reducers.setTool(tool);
    };

    return (
        <UserContext.Provider
            value={{
                users,
                ourUser,
                setUserName,
                setTool,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
