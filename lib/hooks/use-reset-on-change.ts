"use client";

import { useState } from "react";

/**
 * Runs `reset` during render when `token` changes — React's documented way to
 * adjust state in response to a changing value, rather than an effect that
 * fires a second render pass.
 *
 * Used for state that should fall back to a default when you navigate or
 * re-query: open drawers, highlighted rows, stale query text.
 */
export function useResetOnChange<T>(token: T, reset: () => void) {
  const [previous, setPrevious] = useState(token);
  if (previous !== token) {
    setPrevious(token);
    reset();
  }
}
