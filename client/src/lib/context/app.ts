import type { Identity } from "@clockworklabs/spacetimedb-sdk";
import { createContext, useContext } from "react";
import type { Board, DbConnection, SubscriptionBuilder } from "../../module_bindings";

export interface AppContext {
  identity: Identity | null;
  conn: DbConnection | null;
  connected: boolean;
  boards: Board[];
  createBoard: (name: string, colors: string[]) => void;
  clearCurrentBoard: () => void;
  joinBoard: (boardId: number) => void;
  addSubscription: (name: string, queries: string[]) => (() => void) | undefined;
  clearSubscriptions: (name: string) => void;
}

export const AppContext = createContext<AppContext>({
  identity: null,
  conn: null,
  connected: false,
  boards: [],
  createBoard: () => { },
  clearCurrentBoard: () => { },
  joinBoard: () => { },
  addSubscription: () => undefined,
  clearSubscriptions: () => { },
});

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}
