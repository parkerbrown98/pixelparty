import { Eraser, MessageCircleMore, Paintbrush } from "lucide-react";

export default function Toolbar() {
    return (
        <div className="absolute top-4 left-4 flex flex-col items-center justify-center p-1 space-y-1 bg-white shadow-md rounded-md z-10">
            <button className="p-2 hover:bg-gray-100 rounded flex items-center justify-center group transition-colors">
                <Paintbrush className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded flex items-center justify-center group transition-colors">
                <Eraser className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
            </button>
            <div className="w-full h-px bg-gray-300"></div>
            <button className="p-2 hover:bg-gray-100 rounded flex items-center justify-center group transition-colors">
                <MessageCircleMore className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
            </button>
        </div>
    );
}
