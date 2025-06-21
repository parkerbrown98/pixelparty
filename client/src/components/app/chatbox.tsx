import classNames from "classnames";
import { useCanvas } from "../../lib/context/canvas";
import { useState, useRef, useEffect } from "react";
import { useUsers } from "../../lib/context/user";

export default function ChatBox() {
    const { users } = useUsers();
    const { messages, sendMessage, chatEnabled, users: canvasUsers } = useCanvas();
    const [message, setMessage] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesWithUsers = messages.map((message) => ({
        ...message,
        user: users.find(
            (user) =>
                user.identity.toHexString() === message.identity?.toHexString()
        ),
    }));

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messagesWithUsers.length]);

    const handleSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && message.trim() !== "") {
            sendMessage(message);
            setMessage("");
        }
    };

    return (
        <div
            className={classNames(
                "flex flex-col absolute top-4 right-4 w-80 bg-white shadow-md rounded-md z-10 transition-opacity",
                {
                    "opacity-0": !chatEnabled,
                    "opacity-100": chatEnabled,
                }
            )}
        >
            <div className="flex items-center justify-between p-2 border-b border-gray-300">
                <h4>Messages</h4>
                <p className="text-sm text-gray-500">
                    {canvasUsers.length}{" "}
                    {canvasUsers.length === 1 ? "user" : "users"} online
                </p>
            </div>
            <div className="h-96 overflow-y-auto p-2 space-y-1">
                {messagesWithUsers.map((message) => (
                    <div
                        key={message.id}
                        className="flex items-start space-x-2 text-sm"
                    >
                        <p
                            className={classNames("font-semibold", {
                                "text-sky-900": !message.user?.admin,
                                "text-red-800": message.user?.admin,
                            })}
                        >
                            {message.user?.name || "Unknown"}:
                        </p>
                        <p className="text-gray-700 text-wrap wrap-anywhere">
                            {message.content}
                        </p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-300">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full text-sm p-2 focus:outline-none"
                    onKeyDown={handleSendMessage}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>
        </div>
    );
}
