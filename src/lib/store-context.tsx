"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { MergeableStore } from "tinybase";
import { createBroadcastChannelSynchronizer } from "tinybase/synchronizers/synchronizer-broadcast-channel";
import { createWsSynchronizer } from "tinybase/synchronizers/synchronizer-ws-client";
import {
  createAppStore,
  resolveAuthorName,
  type Trip,
  type Member,
  type Message,
  type Poll,
  type PollVote,
  type ItineraryEvent,
} from "./store";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

type UserIdentity = { id: string; name: string };

type StoreContextType = {
  store: MergeableStore;
  currentUser: UserIdentity | null;
  knownUsers: UserIdentity[];
  currentTripId: string | null;
  connectionStatus: ConnectionStatus;
  setCurrentUser: (user: UserIdentity | null) => void;
  setCurrentTripId: (tripId: string | null) => void;
  renameCurrentUser: (newName: string) => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_STORE = "vacation-bb-store";
const STORAGE_KEY_USER = "vacation-bb-user";
const STORAGE_KEY_USERS = "vacation-bb-users";

function migrateStoreData(store: MergeableStore, currentUser: { id: string; name: string } | null) {
  // Migrate members without userId field — backfill from current user by name match
  const members = store.getTable("members");
  for (const [rowId, member] of Object.entries(members)) {
    if (!member.userId || member.userId === "") {
      if (currentUser && member.name === currentUser.name) {
        store.setCell("members", rowId, "userId", currentUser.id);
      }
    }
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createAppStore());
  const [currentUser, setCurrentUserRaw] = useState<UserIdentity | null>(null);
  const [knownUsers, setKnownUsers] = useState<UserIdentity[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  // Load persisted data on mount
  useEffect(() => {
    let savedUser: UserIdentity | null = null;
    try {
      const savedStore = localStorage.getItem(STORAGE_KEY_STORE);
      if (savedStore) {
        const data = JSON.parse(savedStore);
        if (data.tables) {
          store.setTables(data.tables);
        }
        if (data.values) {
          store.setValues(data.values);
        }
      }
      const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUserStr) {
        savedUser = JSON.parse(savedUserStr);
        setCurrentUserRaw(savedUser);
      }

      // Load or migrate user registry
      const savedUsersStr = localStorage.getItem(STORAGE_KEY_USERS);
      if (savedUsersStr) {
        setKnownUsers(JSON.parse(savedUsersStr));
      } else if (savedUser) {
        // Migrate: seed registry from existing single user
        const registry = [savedUser];
        setKnownUsers(registry);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(registry));
      }
    } catch {
      // ignore parse errors
    }

    // Run migration after hydration
    migrateStoreData(store, savedUser);

    setHydrated(true);
  }, [store]);

  // Persist store changes to localStorage
  useEffect(() => {
    if (!hydrated) return;

    const listener = store.addTablesListener(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY_STORE,
          JSON.stringify({
            tables: store.getTables(),
            values: store.getValues(),
          })
        );
      } catch {
        // ignore storage quota errors
      }
    });

    return () => {
      store.delListener(listener);
    };
  }, [store, hydrated]);

  // Persist user to localStorage
  useEffect(() => {
    if (!hydrated) return;
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser, hydrated]);

  // Wrap setCurrentUser to also update the user registry
  const setCurrentUser = useCallback(
    (user: UserIdentity | null) => {
      setCurrentUserRaw(user);
      if (user) {
        setKnownUsers((prev) => {
          const exists = prev.some((u) => u.id === user.id);
          const updated = exists
            ? prev.map((u) => (u.id === user.id ? user : u))
            : [...prev, user];
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
          return updated;
        });
      }
    },
    []
  );

  // Rename current user across localStorage, registry, and all member records
  const renameCurrentUser = useCallback(
    (newName: string) => {
      if (!currentUser) return;
      const updated = { ...currentUser, name: newName };
      setCurrentUserRaw(updated);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));

      // Update registry
      setKnownUsers((prev) => {
        const newList = prev.map((u) =>
          u.id === currentUser.id ? { ...u, name: newName } : u
        );
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(newList));
        return newList;
      });

      // Update all member records for this user
      const members = store.getTable("members");
      for (const [rowId, member] of Object.entries(members)) {
        if (member.userId === currentUser.id) {
          store.setCell("members", rowId, "name", newName);
        }
      }
    },
    [currentUser, store]
  );

  // BroadcastChannel sync for same-browser tab sync
  useEffect(() => {
    if (!hydrated) return;
    let destroyed = false;
    const sync = createBroadcastChannelSynchronizer(store, "voyage-board-sync");
    sync.startSync().catch(() => {});
    return () => {
      if (!destroyed) {
        destroyed = true;
        sync.destroy().catch(() => {});
      }
    };
  }, [store, hydrated]);

  // WebSocket sync for multi-device collaboration
  useEffect(() => {
    if (!hydrated || !currentTripId) {
      setConnectionStatus("disconnected");
      return;
    }

    let destroyed = false;
    let ws: WebSocket | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let retryCount = 0;
    const maxRetries = 10;

    function connect() {
      if (destroyed) return;
      setConnectionStatus("connecting");

      const wsUrl =
        typeof window !== "undefined" && window.location.hostname !== "localhost"
          ? `wss://${window.location.hostname}:8048/${currentTripId}`
          : `ws://localhost:8048/${currentTripId}`;

      try {
        ws = new WebSocket(wsUrl);

        ws.addEventListener("open", () => {
          if (destroyed) return;
          retryCount = 0;
          setConnectionStatus("connected");
          createWsSynchronizer(store, ws!)
            .then((synchronizer) => {
              if (destroyed) {
                synchronizer.destroy();
                return;
              }
              (ws as WebSocket & { _synchronizer?: typeof synchronizer })._synchronizer = synchronizer;
              return synchronizer.startSync();
            })
            .catch(() => {});
        });

        ws.addEventListener("close", () => {
          if (destroyed) return;
          setConnectionStatus("disconnected");
          if (retryCount < maxRetries) {
            const delay = Math.min(2000 * Math.pow(2, retryCount), 16000);
            retryCount++;
            retryTimeout = setTimeout(connect, delay);
          }
        });

        ws.addEventListener("error", () => {
          if (destroyed) return;
          setConnectionStatus("disconnected");
          ws?.close();
        });
      } catch {
        setConnectionStatus("disconnected");
      }
    }

    connect();

    return () => {
      destroyed = true;
      clearTimeout(retryTimeout);
      if (ws) {
        const sync = (ws as WebSocket & { _synchronizer?: { destroy: () => Promise<void> } })._synchronizer;
        if (sync) sync.destroy().catch(() => {});
        ws.close();
      }
      setConnectionStatus("disconnected");
    };
  }, [store, hydrated, currentTripId]);

  if (!hydrated) {
    return null;
  }

  return (
    <StoreContext.Provider
      value={{
        store,
        currentUser,
        knownUsers,
        currentTripId,
        connectionStatus,
        setCurrentUser,
        setCurrentTripId,
        renameCurrentUser,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within StoreProvider");
  return ctx;
}

// Hook to reactively get a table filtered by a field value
export function useTableRows(
  tableName: string,
  filterField?: string,
  filterValue?: string | number
) {
  const { store } = useAppStore();

  const subscribe = useCallback(
    (callback: () => void) => {
      const listenerId = store.addTableListener(tableName, () => {
        callback();
      });
      return () => {
        store.delListener(listenerId);
      };
    },
    [store, tableName, filterField, filterValue]
  );

  const getSnapshot = useCallback(() => {
    const table = store.getTable(tableName);
    let rows = Object.values(table);
    if (filterField && filterValue !== undefined) {
      rows = rows.filter(
        (row) => row[filterField] === filterValue
      );
    }
    return JSON.stringify(rows);
  }, [store, tableName, filterField, filterValue]);

  const serialized = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return JSON.parse(serialized) as Record<string, unknown>[];
}

// Typed table hooks
export function useTrips(): Trip[] {
  return useTableRows("trips") as unknown as Trip[];
}

export function useMembers(tripId: string): Member[] {
  return useTableRows("members", "tripId", tripId) as unknown as Member[];
}

export function useMessages(tripId: string): Message[] {
  return useTableRows("messages", "tripId", tripId) as unknown as Message[];
}

export function usePolls(tripId: string): Poll[] {
  return useTableRows("polls", "tripId", tripId) as unknown as Poll[];
}

export function usePollVotes(): PollVote[] {
  return useTableRows("pollVotes") as unknown as PollVote[];
}

export function useEvents(tripId: string): ItineraryEvent[] {
  return useTableRows("events", "tripId", tripId) as unknown as ItineraryEvent[];
}

// Hook to reactively get a single row
export function useRow(tableName: string, rowId: string) {
  const { store } = useAppStore();

  const subscribe = useCallback(
    (callback: () => void) => {
      const listenerId = store.addRowListener(tableName, rowId, () => {
        callback();
      });
      return () => {
        store.delListener(listenerId);
      };
    },
    [store, tableName, rowId]
  );

  const getSnapshot = useCallback(() => {
    return JSON.stringify(store.getRow(tableName, rowId));
  }, [store, tableName, rowId]);

  const serialized = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return JSON.parse(serialized) as Record<string, unknown>;
}

// Hook to resolve an author name reactively
export function useMemberName(tripId: string, authorId: string, fallbackName?: string): string {
  const { store } = useAppStore();

  const subscribe = useCallback(
    (callback: () => void) => {
      const listenerId = store.addTableListener("members", () => {
        callback();
      });
      return () => {
        store.delListener(listenerId);
      };
    },
    [store, tripId, authorId, fallbackName]
  );

  const getSnapshot = useCallback(() => {
    return resolveAuthorName(store, tripId, authorId, fallbackName);
  }, [store, tripId, authorId, fallbackName]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
