import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { useEffect, useState } from "react";
import {
  DbConnection,
  SubscriptionBuilder,
  type ErrorContext,
} from "../../module_bindings";

export function useSpacetimeDb() {
  const [connected, setConnected] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [conn, setConn] = useState<DbConnection | null>(null);
  const [queries, setQueries] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<ReturnType<
    SubscriptionBuilder["subscribe"]
  > | null>(null);

  const addQueries = (newQueries: string[]) => {
    setQueries((prev) => {
      const uniqueQueries = new Set([...prev, ...newQueries]);
      return Array.from(uniqueQueries);
    });
  };

  const removeQueries = (queriesToRemove: string[]) => {
    setQueries((prev) => {
      const updatedQueries = prev.filter(
        (query) => !queriesToRemove.includes(query)
      );
      return updatedQueries;
    });
  };

  useEffect(() => {
    const onConnect = (
      _con: DbConnection,
      identity: Identity,
      token: string
    ) => {
      setIdentity(identity);
      setConnected(true);
      localStorage.setItem("auth_token", token);
      console.log(
        "Connected to SpacetimeDB with identity:",
        identity.toHexString()
      );
    };

    const onDisconnect = () => {
      console.log("Disconnected from SpacetimeDB");
      setConnected(false);
    };

    const onConnectError = (_ctx: ErrorContext, err: Error) => {
      console.error("Connection error:", err);
    };

    setConn(
      DbConnection.builder()
        .withUri("ws://localhost:3000")
        .withModuleName("pixelparty")
        .withToken(localStorage.getItem("auth_token") || "")
        .onConnect(onConnect)
        .onDisconnect(onDisconnect)
        .onConnectError(onConnectError)
        .build()
    );
  }, []);

  useEffect(() => {
    if (!connected) return;

    if (subscription?.isActive()) {
      subscription?.unsubscribe();
    }

    if (conn && queries.length > 0) {
      const sub = conn
        .subscriptionBuilder()
        .onApplied(() => {
          console.log("Client cache subscriptions have changed.");
        })
        .subscribe(queries);

      setSubscription(sub);
    }
  }, [queries, conn, connected]);

  return { conn, identity, connected, addQueries, removeQueries };
}
