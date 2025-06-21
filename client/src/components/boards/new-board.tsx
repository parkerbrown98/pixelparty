import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { useAppContext } from "../../lib/context/app";

type Props = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

export default function NewBoard({ isOpen, setIsOpen }: Props) {
    const { createBoard } = useAppContext();
    const [name, setName] = useState("");
    const [colorInput, setColorInput] = useState("");
    const [colors, setColors] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColorInput(e.target.value);
        // Separate colors by commas
        const newColors = e.target.value
            .split(",")
            .map((color) => color.trim())
            .filter((color) => color.length > 0); // Remove empty strings
        setColors(newColors);
        // Validate each color (hex format: #RRGGBB or #RGB)
        const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
        const invalidColor = newColors.find(
            (color) => color.length > 0 && !hexColorRegex.test(color)
        );
        if (invalidColor) {
            setError(`Invalid color format: ${invalidColor}`);
        } else {
            setError(null);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 50) {
            setError("Name cannot exceed 20 characters.");
            return;
        }

        if (e.target.value.trim() === "") {
            setError("Name cannot be empty.");
            return;
        }

        setName(e.target.value);
    };

    const handleCreateBoard = (e: React.FormEvent) => {
        e.preventDefault();

        if (name.trim() === "") {
            setError("Board name cannot be empty.");
            return;
        }

        if (colors.length < 2) {
            setError("At least two colors are required to create a board.");
            return;
        }

        if (error) {
            return; // Prevent creation if there's an error
        }

        createBoard(name, colors);
        setIsOpen(false);
        setName("");
        setColorInput("");
        setColors([]);
    };

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setColorInput("");
            setColors([]);
            setError(null);
        }
    }, [isOpen]);

    return (
        <Dialog
            as="div"
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="relative z-10 focus:outline-none"
        >
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-black/30 duration-300 ease-out data-closed:opacity-0 backdrop-blur-sm"
                />
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full max-w-md rounded-md bg-white p-6 shadow-md duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 z-20"
                    >
                        <DialogTitle as="h3">Create New World</DialogTitle>
                        {error && (
                            <div className="text-red-500 mt-4 text-sm">
                                {error}
                            </div>
                        )}
                        <form
                            id="new-board"
                            className="mt-4"
                            onSubmit={handleCreateBoard}
                        >
                            <label htmlFor="name" className="block mb-2">
                                Name (max 50 characters):
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 border border-gray-300"
                                placeholder="Enter world name"
                            />
                            <label htmlFor="colors" className="block mt-4 mb-2">
                                Colors (comma-separated, e.g. #ff0000, #00ff00):
                            </label>
                            <input
                                id="colors"
                                type="text"
                                value={colorInput}
                                onChange={handleColorInputChange}
                                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 border border-gray-300"
                                placeholder="#ff0000, #00ff00"
                            />
                        </form>
                        <div className="flex justify-end mt-4">
                            {/* Cancel button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            {/* Create button */}
                            <button
                                type="submit"
                                form="new-board"
                                className="ml-2 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
