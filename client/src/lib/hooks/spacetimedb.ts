import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  DbConnection,
  SubscriptionBuilder,
  type ErrorContext,
} from "../../module_bindings";

const DEFAULT_QUERIES = [
  "SELECT * FROM board",
  "SELECT * FROM user",
];

export function useSpacetimeDb() {
  const [connected, setConnected] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [conn, setConn] = useState<DbConnection | null>(null);

  // Keep track of all active subscription handles
  const subscriptions = useRef<Map<string, Set<ReturnType<SubscriptionBuilder["subscribe"]>>>>(new Map());

  // Called once when first connecting
  useEffect(() => {
    const onConnect = (_: DbConnection, identity: Identity, token: string) => {
      setIdentity(identity);
      setConnected(true);
      localStorage.setItem("auth_token", token);
      console.log("Connected to SpacetimeDB with identity:", identity.toHexString());
    };

    const onDisconnect = () => {
      console.log("Disconnected from SpacetimeDB");
      setConnected(false);
    };

    const onConnectError = (_ctx: ErrorContext, err: Error) => {
      console.error("Connection error:", err);
    };

    const connection = DbConnection.builder()
      .withUri("ws://10.65.0.100:3000")
      .withModuleName("pixelparty")
      .withToken(localStorage.getItem("auth_token") || "")
      .onConnect(onConnect)
      .onDisconnect(onDisconnect)
      .onConnectError(onConnectError)
      .build();

    setConn(connection);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptions.current.forEach(setOfHandles => {
        setOfHandles.forEach(handle => {
          if (!handle.isEnded()) {
            handle.unsubscribe();
          }
        });
      });
      conn?.disconnect();
    };
  }, [conn]);

  // Expose functions for components to subscribe/unsubscribe
  const addSubscription = useCallback((key: string, queries: string[]) => {
    if (!conn) {
      console.warn("Cannot subscribe before connection is established");
      return;
    }

    const builder = conn.subscriptionBuilder()
      .onApplied(() => console.log(`Subscription [${key}] applied`))
      .onError((ctx) => console.error(`Subscription [${key}] error:`, ctx.event?.message || "Unknown error"));

    const handle = builder.subscribe(queries);

    let handles = subscriptions.current.get(key);
    if (!handles) {
      handles = new Set();
      subscriptions.current.set(key, handles);
    }
    handles.add(handle);

    return () => {
      handle.unsubscribe();
      handles!.delete(handle);
      if (handles!.size === 0) {
        subscriptions.current.delete(key);
      }
    };
  }, [conn]);

  const clearSubscriptions = useCallback((key: string) => {
    const handles = subscriptions.current.get(key);
    if (handles) {
      handles.forEach(handle => {
        if (!handle.isEnded()) {
          handle.unsubscribe();
        }
      });
      subscriptions.current.delete(key);
    }
  }, []);

  // Optionally run default default queries only once after connect
  useEffect(() => {
    if (conn && connected) {
      // E.g., initial global subscription
      addSubscription("default", DEFAULT_QUERIES);
    }
  }, [conn, connected, addSubscription]);

  return {
    conn,
    identity,
    connected,
    addSubscription,
    clearSubscriptions,
  };
}
