"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";

import { LocaleToggle, ThemeToggle } from "@/components/brand/toggles";
import { useCart } from "@/components/providers/cart-provider";
import { SearchOverlay } from "@/components/store/search-overlay";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { useFocusTrap, useScrollLock } from "@/lib/hooks/use-focus-trap";
import { useResetOnChange } from "@/lib/hooks/use-reset-on-change";
import { backdrop, dur, ease } from "@/lib/motion";

export function Header() {
  const { dict, href, isRtl } = useLocale();
  const { count: bagCount, setOpen, pulse, products, wishlist } = useCart();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const reduced = useReducedMotion();

  const links = [
    { label: dict.nav.collections, path: "/collection" },
    { label: dict.nav.families, path: "/collection?view=families" },
    { label: dict.nav.gifts, path: "/collection?filter=gifts" },
    { label: dict.nav.discovery, path: "/collection?filter=discovery" },
    { label: dict.nav.journal, path: "/collection?view=journal" },
  ];

  // Close the drawer on navigation, and on Escape.
  useResetOnChange(pathname, () => setNavOpen(false));

  const drawerRef = useFocusTrap<HTMLDivElement>(navOpen);
  useScrollLock(navOpen);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  function openBag() {
    setNavOpen(false);
    setOpen(true);
  }

  // Opening search closes the nav drawer — one modal surface at a time.
  useResetOnChange(searchOpen, () => {
    if (searchOpen) setNavOpen(false);
  });

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="shell page-x flex items-center gap-3 py-4 lg:gap-8">
          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label={dict.nav.menu}
            aria-expanded={navOpen}
            className="-ms-2 grid min-h-11 w-11 shrink-0 place-items-center lg:hidden"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>

          <Link
            href={href("/")}
            className="wordmark min-w-0 truncate text-[15px] lg:shrink-0 lg:text-[18px]"
          >
            {dict.brand}
          </Link>

          <nav
            aria-label={dict.nav.collections}
            className="hidden flex-1 items-center gap-8 lg:flex"
          >
            {links.map((l) => {
              const active = pathname === href(l.path.split("?")[0]);
              return (
                <Link
                  key={l.path}
                  href={href(l.path)}
                  className={cn(
                    "border-b-2 py-1 text-[13px] font-medium transition-colors",
                    active
                      ? "border-[var(--aqua)] text-[var(--ink)]"
                      : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-0.5 lg:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={dict.nav.search}
              className="hidden min-h-11 w-11 place-items-center transition-colors hover:text-[var(--aqua-ink)] lg:grid"
            >
              <Search className="size-[18px]" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={dict.nav.search}
              className="grid min-h-11 w-11 place-items-center transition-colors hover:text-[var(--aqua-ink)] lg:hidden"
            >
              <Search className="size-[18px]" strokeWidth={1.5} />
            </button>

            <LocaleToggle className="hidden lg:block" />
            <ThemeToggle className="hidden lg:grid" />

            <Link
              href={href("/wishlist")}
              aria-label={`${dict.nav.wishlist} (${wishlist.length})`}
              className="relative hidden min-h-11 w-11 place-items-center transition-colors hover:text-[var(--aqua-ink)] lg:grid"
            >
              <Heart
                className={cn(
                  "size-[18px]",
                  wishlist.length > 0 && "fill-[var(--rose)] text-[var(--rose)]",
                )}
                strokeWidth={1.5}
              />
            </Link>

            <button
              type="button"
              onClick={openBag}
              aria-label={`${dict.nav.bag} (${bagCount})`}
              className="relative grid min-h-11 w-11 place-items-center transition-colors hover:text-[var(--aqua-ink)]"
            >
              <ShoppingBag className="size-[18px]" strokeWidth={1.5} />
              {bagCount > 0 ? (
                <motion.span
                  key={pulse}
                  animate={reduced ? undefined : { scale: [1, 1.2, 1] }}
                  transition={{ duration: dur.base, ease: ease.scent }}
                  className="num absolute top-1.5 end-1 grid min-w-4 place-items-center rounded-full bg-[var(--primary-c)] px-1 text-[10px] font-bold text-[var(--on-primary)]"
                >
                  {bagCount}
                </motion.span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer — opens from the inline start. */}
      <AnimatePresence>
        {navOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label={dict.nav.close}
              variants={backdrop}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={() => setNavOpen(false)}
              className="absolute inset-0 bg-[var(--scrim)]"
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={dict.nav.menu}
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ duration: dur.base, ease: ease.scent }}
              className="absolute inset-y-0 start-0 flex w-[320px] max-w-[86%] flex-col bg-[var(--surface-raised)] shadow-[var(--shadow-overlay)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
                <span className="wordmark text-[15px]">{dict.brand}</span>
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  aria-label={dict.nav.close}
                  className="grid min-h-11 w-11 place-items-center"
                >
                  <X className="size-5" strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-2">
                {[...links, { label: dict.nav.wishlist, path: "/wishlist" }].map(
                  (l) => (
                    <Link
                      key={l.path}
                      href={href(l.path)}
                      className="flex min-h-[52px] items-center py-3.5 text-[22px] font-normal [font-family:var(--font-display-family)]"
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </nav>

              <div className="flex flex-col gap-2 border-t border-[var(--line)] p-4">
                <LocaleToggle block />
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <SearchOverlay
        open={searchOpen}
        onOpenChange={setSearchOpen}
        products={products}
      />
    </>
  );
}
