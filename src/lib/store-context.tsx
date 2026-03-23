"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { Store } from "tinybase";
import { createAppStore } from "./store";

type StoreContextType = {
  store: Store;
  currentUser: { id: string; name: string } | null;
  currentTripId: string | null;
  setCurrentUser: (user: { id: string; name: string } | null) => void;
  setCurrentTripId: (tripId: string | null) => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_STORE = "vacation-bb-store";
const STORAGE_KEY_USER = "vacation-bb-user";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createAppStore());
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
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
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore parse errors
    }
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

  if (!hydrated) {
    return null;
  }

  return (
    <StoreContext.Provider
      value={{
        store,
        currentUser,
        currentTripId,
        setCurrentUser,
        setCurrentTripId,
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
    [store, tableName]
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
