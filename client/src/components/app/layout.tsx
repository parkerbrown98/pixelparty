import { useUsers } from "../../lib/context/user";
import CanvasProvider from "../../lib/providers/canvas";
import Canvas from "../boards/canvas";
import ChangeBoard from "../boards/change-board";
import ChangeName from "./change-name";
import ChatBox from "./chatbox";
import Toolbar from "./toolbar";

export default function Layout() {
    const { ourUser } = useUsers();

    if (!ourUser?.name) {
        return <ChangeName />;
    }

    if (!ourUser?.currentBoard) {
        return <ChangeBoard />;
    }

    return (
        <div className="relative w-full h-full">
            <CanvasProvider>
                <Toolbar />
                <ChatBox />
                <Canvas />
            </CanvasProvider>
        </div>
    );
}
