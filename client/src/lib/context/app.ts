import type { Identity } from "@clockworklabs/spacetimedb-sdk";
import { createContext, useContext } from "react";
import type { DbConnection } from "../../module_bindings";

export interface AppContext {
  identity: Identity | null;
  conn: DbConnection | null;
  connected: boolean;
  addQueries: (queries: string[]) => void;
  removeQueries: (queries: string[]) => void;
}

export const AppContext = createContext<AppContext>({
  identity: null,
  conn: null,
  connected: false,
  addQueries: () => {},
  removeQueries: () => {},
});

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}
