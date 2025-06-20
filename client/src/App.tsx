import BoardList from "./components/boards/board-list";
import Canvas from "./components/boards/canvas";
import { AppProvider } from "./lib/providers/app";

function App() {
  return (
    <AppProvider>
      <div className="container">
        <h2>SpacetimeDB Board List</h2>
        <BoardList />
        <Canvas />
      </div>
    </AppProvider>
  );
}

export default App;
