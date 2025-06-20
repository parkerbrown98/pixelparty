import { useAppContext } from "../../lib/context/app";
import classNames from "classnames";

export default function Navbar() {
    const { connected } = useAppContext();

    return (
        <header className="p-4 bg-white shadow-md flex justify-between items-center">
            <a href="/" className="text-xl font-bold">
                PixelParty
            </a>
            <div className="flex items-center space-x-1.5">
                <div
                    className={classNames("w-2 h-2 rounded-full", {
                        "bg-green-500 animate-pulse": connected,
                        "bg-red-500": !connected,
                    })}
                ></div>
                <span className="text-sm text-gray-600">
                    {connected ? "Connected" : "Disconnected"}
                </span>
            </div>
        </header>
    );
}
