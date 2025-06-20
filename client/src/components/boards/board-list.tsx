import { useBoards } from "../../lib/hooks/boards";

export default function BoardList() {
  const boards = useBoards();

  return (
    <div className="board-list">
      {Array.from(boards.values()).map((board) => (
        <div key={board.id.toString()} className="board-item">
          <h3>{board.name}</h3>
          <p>{board.createdAt.toDate().toISOString()}</p>
        </div>
      ))}
    </div>
  );
}
