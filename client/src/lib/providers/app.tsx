import { AppContext } from "../context/app";
import { useSpacetimeDb } from "../hooks/spacetimedb";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { conn, identity, connected, addQueries, removeQueries } =
    useSpacetimeDb();

  return (
    <AppContext.Provider
      value={{ identity, conn, connected, addQueries, removeQueries }}
    >
      {children}
    </AppContext.Provider>
  );
}