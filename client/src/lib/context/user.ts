import { createContext, useContext } from "react";
import type { ToolType, User } from "../../module_bindings";

export interface UserContext {
    users: User[];
    ourUser: User | undefined;
    setUserName: (name: string) => void;
    setTool: (tool: ToolType) => void;
}

export const UserContext = createContext<UserContext>({
    users: [],
    ourUser: undefined,
    setUserName: () => { },
    setTool: () => { },
});

export function useUsers() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUsers must be used within a UserProvider");
    }

    return context;
}