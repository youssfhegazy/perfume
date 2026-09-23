"use client";

import { useCallback, useSyncExternalStore } from "react";

/* localStorage-backed state.

   `useSyncExternalStore` rather than read-in-an-effect: the server snapshot is
   the default, the client snapshot is what storage holds, and React reconciles
   the two after hydration without a mismatch and without a cascading render.

   Cart, wishlist and theme persist; the catalogue never does. Storage can throw
   or come back empty in a private window or with site data blocked, so every
   access is guarded and the default is always a working fallback. */

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Other tabs.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/* getSnapshot must be referentially stable between unchanged reads, so parsed
   values are cached against the raw string they came from. */
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }
  if (raw === null) return fallback;

  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;

  try {
    const value = JSON.parse(raw) as T;
    cache.set(key, { raw, value });
    return value;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    const raw = JSON.stringify(value);
    window.localStorage.setItem(key, raw);
    cache.set(key, { raw, value });
  } catch {
    // Quota or blocked storage — the app still works, it just forgets.
    cache.set(key, { raw: null, value });
  }
  emit();
}

/**
 * `initial` must be referentially stable (a module constant or primitive) —
 * it is the server snapshot, and a fresh object each render would loop.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, initial),
    () => initial,
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(read(key, initial))
          : next;
      write(key, resolved);
    },
    [key, initial],
  );

  return [value, setValue] as const;
}

/* ------------------------------ session flag ----------------------------- */

const sessionListeners = new Set<() => void>();

function subscribeSession(onChange: () => void) {
  sessionListeners.add(onChange);
  return () => {
    sessionListeners.delete(onChange);
  };
}

function readSession(key: string) {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/** Session-scoped flag, used by the dismissible announcement bar. */
export function useSessionFlag(key: string) {
  const on = useSyncExternalStore(
    subscribeSession,
    () => readSession(key),
    () => false,
  );

  const set = useCallback(
    (next: boolean) => {
      try {
        if (next) window.sessionStorage.setItem(key, "1");
        else window.sessionStorage.removeItem(key);
      } catch {
        // Nothing to do — the bar simply reappears next navigation.
      }
      for (const l of sessionListeners) l();
    },
    [key],
  );

  return [on, set] as const;
}

/**
 * True only after hydration. Lets a component render server-stable markup on
 * the first pass and swap in client-only detail afterwards.
 */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
