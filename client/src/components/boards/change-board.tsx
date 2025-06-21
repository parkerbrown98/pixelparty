import { useState } from "react";
import { useAppContext } from "../../lib/context/app";
import { useUsers } from "../../lib/context/user";
import NewBoard from "./new-board";

export default function ChangeBoard() {
    const { ourUser } = useUsers();
    const { boards, joinBoard } = useAppContext();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <>
            <NewBoard isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} />
            <div className="w-full h-full flex items-center justify-center">
                <div className="bg-white p-4 rounded-md shadow-md w-96">
                    <h2 className="mb-1">Change World</h2>
                    <p className="text-gray-600 mb-4">
                        Select a world to begin painting and chatting.
                    </p>
                    {boards.length > 0 ? (
                        <div className="space-y-2 mb-4">
                            {boards.map((board) => (
                                <button
                                    key={board.id}
                                    onClick={() => joinBoard(board.id)}
                                    className="w-full text-left bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                >
                                    {board.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            No worlds available. Whomp.
                        </p>
                    )}
                    {ourUser?.admin && (
                        <p className="text-gray-500">
                            As an admin, you can{" "}
                            <span
                                onClick={() => setIsCreateOpen(true)}
                                className="text-blue-500 hover:underline cursor-pointer"
                            >
                                create a new world.
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
