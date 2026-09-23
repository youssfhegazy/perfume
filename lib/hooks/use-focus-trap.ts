"use client";

import { useEffect, useRef } from "react";

/* Focus management for modal surfaces — the bag drawer, the nav drawers and
   the command palette. The handoff calls these out as only approximated in the
   prototype: they need a real trap plus focus restore.

   On open: focus moves into the panel. While open: Tab cycles inside it.
   On close: focus returns to whatever opened it. */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const panel = ref.current;
    if (!panel) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Move focus in — the first control, or the panel itself if it has none.
    const first = focusables()[0];
    if (first) first.focus();
    else {
      panel.setAttribute("tabindex", "-1");
      panel.focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const current = document.activeElement;

      if (e.shiftKey && (current === firstEl || !panel!.contains(current))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && current === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);

      // Restore focus to whatever opened this. Skipped when the opener was
      // never focusable (activeElement was <body>) or has since been removed —
      // focusing those would just drop focus to the document.
      const target = restoreTo.current;
      restoreTo.current = null;
      if (!target || target === document.body) return;
      if (!document.contains(target)) return;

      // After the commit, so an exit animation unmounting the panel cannot
      // take focus back off the trigger.
      requestAnimationFrame(() => {
        if (document.contains(target)) target.focus();
      });
    };
  }, [active]);

  return ref;
}

/** Locks body scroll while a modal surface is open. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
