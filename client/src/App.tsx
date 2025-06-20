import Navbar from "./components/app/navbar";
import Toolbar from "./components/app/toolbar";
import Canvas from "./components/boards/canvas";
import { AppProvider } from "./lib/providers/app";

function App() {
    return (
        <AppProvider>
            <div className="h-screen flex flex-col">
                <Navbar />
                <div className="relative w-full h-full">
                    <Toolbar />
                    <Canvas />
                </div>
            </div>
        </AppProvider>
    );
}

export default App;
