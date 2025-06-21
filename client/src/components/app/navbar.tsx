import { useAppContext } from "../../lib/context/app";
import classNames from "classnames";
import { useUsers } from "../../lib/context/user";

export default function Navbar() {
    const { connected } = useAppContext();
    const { ourUser } = useUsers();

    return (
        <header className="p-4 bg-white shadow-md flex justify-between items-center z-10">
            <div className="flex items-center space-x-2">
                <a href="/" className="text-xl font-bold">
                    PixelParty
                </a>
                <div className="rounded-4xl bg-gray-100 px-3 py-0.5 text-sm text-gray-700 font-medium">
                    {ourUser?.name || "Guest"}
                </div>
                {ourUser?.admin && (
                    <div className="rounded-4xl bg-yellow-100 px-3 py-0.5 text-sm text-yellow-700 font-medium">
                        Admin
                    </div>
                )}
            </div>
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
