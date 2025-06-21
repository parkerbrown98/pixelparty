import {
    Eraser,
    Grid,
    MessageCircleMore,
    Paintbrush,
    Users2,
} from "lucide-react";
import { useCanvas } from "../../lib/context/canvas";
import classNames from "classnames";
import ColorPicker from "./color-picker";

export default function Toolbar() {
    const { chatEnabled, setChatEnabled, gridEnabled, setGridEnabled } =
        useCanvas();

    return (
        <div className="absolute top-4 left-4 flex flex-col items-center justify-center p-1 space-y-1 bg-white shadow-md rounded-md z-10">
            <button className="p-2 hover:bg-gray-100 rounded flex items-center justify-center group transition-colors">
                <Paintbrush className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded flex items-center justify-center group transition-colors">
                <Eraser className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
            </button>
            <ColorPicker />
            <div className="w-full h-px bg-gray-300"></div>
            <button
                onClick={() => setGridEnabled(!gridEnabled)}
                className={classNames(
                    "p-2 rounded flex items-center justify-center group transition-colors hover:bg-gray-100",
                    {
                        "bg-transparent": !gridEnabled,
                    }
                )}
            >
                <Grid
                    className={classNames("w-4 h-4 transition-colors", {
                        "text-gray-700 group-hover:text-blue-500": !gridEnabled,
                        "text-blue-500": gridEnabled,
                    })}
                />
            </button>
            <button
                onClick={() => setChatEnabled(!chatEnabled)}
                className={classNames(
                    "p-2 rounded flex items-center justify-center group transition-colors hover:bg-gray-100",
                    {
                        "bg-transparent ": !chatEnabled,
                    }
                )}
            >
                <MessageCircleMore
                    className={classNames("w-4 h-4 transition-colors", {
                        "text-gray-700 group-hover:text-blue-500": !chatEnabled,
                        "text-blue-500": chatEnabled,
                    })}
                />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded flex items-center justify-center group transition-colors">
                <Users2 className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
            </button>
        </div>
    );
}
