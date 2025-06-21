import { useState } from "react";
import { useAppContext } from "../../lib/context/app";
import { useUsers } from "../../lib/context/user";

export default function ChangeName() {
    const { connected } = useAppContext();
    const { ourUser, setUserName } = useUsers();
    const [name, setName] = useState(ourUser?.name || "");

    const handleSetUserName = (name: string) => {
        if (!connected || !name.length) return;
        setUserName(name.trim());
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="bg-white p-4 rounded-md shadow-md w-80">
                {connected ? (
                    <>
                        <h2 className="text-lg font-semibold mb-4">
                            Set Your Username
                        </h2>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    e.currentTarget.value.trim() !== ""
                                ) {
                                    handleSetUserName(name);
                                }
                            }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button
                            onClick={() => handleSetUserName(name)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
                        >
                            Set Username
                        </button>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            Please connect to the server to set your username.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
