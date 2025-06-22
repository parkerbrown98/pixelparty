import { createContext, useContext } from "react";
import type { Message, Pixel, User } from "../../module_bindings";

export interface CanvasContext {
    canvasId: number | null;
    messages: Message[];
    users: User[];
    pixels: Pixel[];
    availableColors: string[];
    paint: (x: number, y: number) => void;
    chatEnabled?: boolean;
    setChatEnabled: (enabled: boolean) => void;
    sendMessage: (message: string) => void;
    gridEnabled: boolean;
    setGridEnabled: (enabled: boolean) => void;
};

export const CanvasContext = createContext<CanvasContext>({
    canvasId: null,
    messages: [],
    users: [],
    pixels: [],
    availableColors: [],
    paint: () => { },
    chatEnabled: false,
    setChatEnabled: () => { },
    sendMessage: () => { },
    gridEnabled: true,
    setGridEnabled: () => { },
});

export function useCanvas() {
    const context = useContext(CanvasContext);

    if (!context) {
        throw new Error("useCanvas must be used within a CanvasProvider");
    }

    return context;
}