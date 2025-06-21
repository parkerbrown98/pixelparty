import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useUsers } from "../../lib/context/user";
import { useCanvas } from "../../lib/context/canvas";
import { useAppContext } from "../../lib/context/app";

export default function ColorPicker() {
    const { conn } = useAppContext();
    const { ourUser } = useUsers();
    const { availableColors } = useCanvas();

    const handleColorChange = (color: string) => {
        if (!conn || !ourUser) return;
        conn.reducers.setColor(color);
    };

    return (
        <Menu as="div" className="relative">
            <MenuButton
                className="w-5 aspect-square rounded-full transition hover:ring-2 hover:ring-offset-2 hover:ring-blue-100 focus:outline-none data-open:ring-2 data-open:ring-offset-2 data-open:ring-offset-white data-open:ring-blue-300"
                style={{
                    backgroundColor: ourUser?.currentColor || "#000000",
                }}
            ></MenuButton>
            <MenuItems
                transition
                as="div"
                className="absolute left-9 top-1/2 -translate-y-1/2 flex items-center p-1 space-x-1 rounded bg-white shadow-md transition focus:outline-none data-closed:scale-95 data-closed:opacity-0"
            >
                {availableColors.map((color) => (
                    <MenuItem
                        key={color}
                        as="div"
                        className="w-6 aspect-square rounded-full transition cursor-pointer hover:ring-1 hover:ring-offset-1 hover:ring-gray-300"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                    ></MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
}
