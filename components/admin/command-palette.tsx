"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useLocale } from "@/components/providers/locale-provider";
import { navGroups } from "@/components/admin/nav";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { useResetOnChange } from "@/lib/hooks/use-reset-on-change";
import { displayName } from "@/lib/format";
import { dur, ease } from "@/lib/motion";
import type { Order, Product } from "@/lib/types";

interface Hit {
  id: string;
  label: string;
  group: string;
  path: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  products,
  orders,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: Product[];
  orders: Order[];
}) {
  const { dict, locale, href } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const index = useMemo<Hit[]>(() => {
    const nav = navGroups(dict, { orders: 0, reviews: 0 }).flatMap((g) =>
      g.items.map((i) => ({
        id: `nav-${i.key}`,
        label: i.label,
        group: g.title,
        path: i.path,
      })),
    );
    const prods = products.map((p) => ({
      id: `product-${p.id}`,
      label: displayName(p, locale),
      group: dict.admin.products,
      path: `/admin/products/${p.id}`,
    }));
    const ords = orders.map((o) => ({
      id: `order-${o.id}`,
      label: `${o.id} · ${o.customer.name}`,
      group: dict.admin.orders,
      path: `/admin/orders/${o.id}`,
    }));
    return [...nav, ...prods, ...ords];
  }, [dict, locale, products, orders]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? index.filter((h) => h.label.toLowerCase().includes(q))
      : index;
    return list.slice(0, 8);
  }, [index, query]);

  const panelRef = useFocusTrap<HTMLDivElement>(open);

  // A new query re-highlights the first row; closing clears the box.
  useResetOnChange(query, () => setActive(0));
  useResetOnChange(open, () => {
    if (!open) setQuery("");
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(results.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" && results[active]) {
        e.preventDefault();
        router.push(href(results[active].path));
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange, results, active, router, href]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label={dict.nav.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-[var(--scrim)]"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.admin.search}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: dur.base, ease: ease.scent }}
            className="absolute top-24 left-1/2 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-[var(--r-lg)] bg-[var(--surface-raised)] shadow-[var(--shadow-overlay)]"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.admin.cmdPlaceholder}
              aria-label={dict.admin.search}
              className="h-14 w-full border-b border-[var(--line)] bg-transparent px-5 text-base outline-none"
            />
            <ul className="max-h-[320px] overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-4 text-sm text-[var(--ink-muted)]">
                  {dict.admin.cmdEmpty}
                </li>
              ) : (
                results.map((hit, i) => (
                  <li key={hit.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => {
                        router.push(href(hit.path));
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[var(--r-md)] px-3 py-2.5 text-start text-sm",
                        i === active && "bg-[var(--aqua-soft)]",
                      )}
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-[var(--aqua)]"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate">{hit.label}</span>
                      <span className="shrink-0 text-[12px] text-[var(--ink-muted)]">
                        {hit.group}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
