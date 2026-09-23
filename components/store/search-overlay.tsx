"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { displayName, fromPrice, money } from "@/lib/format";
import { useFocusTrap, useScrollLock } from "@/lib/hooks/use-focus-trap";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { useResetOnChange } from "@/lib/hooks/use-reset-on-change";
import { t } from "@/lib/i18n/dictionary";
import { productImage } from "@/lib/images";
import { dur, ease } from "@/lib/motion";
import type { Product } from "@/lib/types";

/* Command-style search over the live catalogue — products, families and notes.
   A full-screen sheet on phones, a centred dialog from lg up. Recent searches
   persist per viewer. */

const NO_RECENT: string[] = [];
const MAX_RECENT = 5;

export function SearchOverlay({
  open,
  onOpenChange,
  products,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: Product[];
}) {
  const { dict, locale, href } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = usePersistedState<string[]>(
    "mo:recent-searches",
    NO_RECENT,
  );

  const panelRef = useFocusTrap<HTMLDivElement>(open);
  useScrollLock(open);

  // Closing clears the box.
  useResetOnChange(open, () => {
    if (!open) setQuery("");
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  /* Match on either language's name, the family label and every note. */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        const notes = [...p.notes.top, ...p.notes.heart, ...p.notes.base]
          .flat()
          .join(" ")
          .toLowerCase();
        const haystack = [
          p.name,
          p.ar,
          p.conc,
          dict.families[p.fam],
          notes,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 6);
  }, [products, query, dict]);

  const go = useCallback(
    (product: Product) => {
      const term = query.trim();
      if (term) {
        setRecent((prev) =>
          [term, ...prev.filter((r) => r !== term)].slice(0, MAX_RECENT),
        );
      }
      onOpenChange(false);
      router.push(href(`/product/${product.id}`));
    },
    [query, setRecent, onOpenChange, router, href],
  );

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
            aria-label={dict.nav.search}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: dur.base, ease: ease.scent }}
            className={cn(
              "absolute inset-x-0 top-0 flex max-h-full flex-col bg-[var(--surface-raised)] shadow-[var(--shadow-overlay)]",
              "lg:inset-x-auto lg:top-24 lg:left-1/2 lg:w-[min(640px,92vw)] lg:-translate-x-1/2 lg:rounded-[var(--r-lg)]",
            )}
          >
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 lg:px-5">
              <Search
                className="size-[18px] shrink-0 text-[var(--ink-muted)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.nav.searchPlaceholder}
                aria-label={dict.nav.search}
                className="min-h-14 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-[var(--ink-muted)]"
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label={dict.nav.close}
                className="grid size-10 shrink-0 place-items-center"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {query.trim() === "" ? (
                recent.length ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2">
                      <p className="eyebrow text-[var(--ink-muted)]">
                        {dict.nav.searchRecent}
                      </p>
                      <button
                        type="button"
                        onClick={() => setRecent(NO_RECENT)}
                        className="text-[12px] text-[var(--aqua-ink)] underline underline-offset-4"
                      >
                        {dict.nav.searchClear}
                      </button>
                    </div>
                    <ul>
                      {recent.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => setQuery(term)}
                            className="flex w-full items-center gap-3 rounded-[var(--r-sm)] px-3 py-2.5 text-start text-sm hover:bg-[var(--aqua-soft)]"
                          >
                            <Search
                              className="size-3.5 shrink-0 text-[var(--ink-muted)]"
                              strokeWidth={1.5}
                              aria-hidden
                            />
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="px-3 py-6 text-sm text-[var(--ink-muted)]">
                    {dict.nav.searchHint}
                  </p>
                )
              ) : results.length === 0 ? (
                <p className="px-3 py-6 text-sm text-[var(--ink-muted)]">
                  {t(dict.nav.searchEmpty, { q: query.trim() })}
                </p>
              ) : (
                <ul>
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => go(p)}
                        className="flex w-full items-center gap-3 rounded-[var(--r-sm)] p-2 text-start hover:bg-[var(--aqua-soft)]"
                      >
                        <span className="relative h-[55px] w-11 shrink-0 overflow-hidden bg-[var(--surface-sunken)]">
                          <Image
                            src={productImage(p)}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {displayName(p, locale)}
                          </span>
                          <span className="block truncate text-[12px] text-[var(--ink-muted)]">
                            {dict.families[p.fam]} · {p.conc}
                          </span>
                        </span>
                        <span className="num shrink-0 text-[13px] font-semibold">
                          {money(fromPrice(p), locale)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
