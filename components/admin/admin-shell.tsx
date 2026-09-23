"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react";

import { MoButton, MoLink } from "@/components/brand/button";
import { LocaleToggle, ThemeToggle } from "@/components/brand/toggles";
import { CommandPalette } from "@/components/admin/command-palette";
import { navGroups, SHOWS_NEW_PRODUCT, type NavKey } from "@/components/admin/nav";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { useFocusTrap, useScrollLock } from "@/lib/hooks/use-focus-trap";
import { useResetOnChange } from "@/lib/hooks/use-reset-on-change";
import { count } from "@/lib/format";
import { signOut } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/session";
import type { Order, Product } from "@/lib/types";

/* Dashboard chrome: 248px sidebar collapsing to a 68px icon rail, a sticky
   72px top bar, ⌘K palette, and — below md — a bottom tab bar in place of the
   sidebar, because the client runs this from a phone. */

export function AdminShell({
  active,
  breadcrumb,
  title,
  products,
  orders,
  pendingReviews,
  session,
  children,
}: {
  active: NavKey;
  breadcrumb: string;
  title: string;
  products: Product[];
  orders: Order[];
  pendingReviews: number;
  session: SessionUser;
  children: React.ReactNode;
}) {
  const { dict, locale, href } = useLocale();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [more, setMore] = useState(false);
  const [palette, setPalette] = useState(false);

  const newOrders = orders.filter((o) => o.status === "new").length;
  const groups = navGroups(
    dict,
    { orders: newOrders, reviews: pendingReviews },
    session.role,
  );

  const roleLabel = {
    owner: dict.admin.roleOwner,
    admin: dict.admin.roleAdmin,
    editor: dict.admin.roleEditor,
    fulfilment: dict.admin.roleFulfilment,
  }[session.role];

  const initials = session.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Both close on navigation.
  useResetOnChange(pathname, () => {
    setDrawer(false);
    setMore(false);
  });

  const drawerRef = useFocusTrap<HTMLDivElement>(drawer);
  const moreRef = useFocusTrap<HTMLDivElement>(more);
  useScrollLock(drawer);

  useEffect(() => {
    if (!drawer && !more) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setDrawer(false);
      setMore(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, more]);

  const showNewProduct = SHOWS_NEW_PRODUCT.includes(active);
  const Chevron = locale === "ar" ? ChevronRight : ChevronLeft;

  const tabs = groups
    .flatMap((g) => g.items)
    .filter((i) => ["overview", "orders", "products"].includes(i.key));

  /* Tablets get the 68px icon rail; the full 248px sidebar starts at lg,
     where the collapse toggle takes over. Done in CSS so there is no
     first-paint flash from a media-query hook. */
  const railOnly = "hidden lg:inline";
  const expanded = collapsed ? "hidden" : railOnly;

  return (
    <div className="flex min-h-dvh bg-[var(--surface)]">
      {/* Sidebar: icon rail from md, full width from lg */}
      <aside
        className={cn(
          "hidden w-[68px] shrink-0 flex-col border-e border-[var(--line)] bg-[var(--surface-raised)] transition-[width] duration-200 md:flex",
          collapsed ? "lg:w-[68px]" : "lg:w-[248px]",
        )}
      >
        <div className="flex items-center gap-2.5 px-4 py-4">
          <span className="grid size-7 shrink-0 place-items-center rounded-[var(--r-sm)] bg-[var(--deep)] text-[13px] text-[var(--on-deep)] [font-family:var(--font-display-family)]">
            M
          </span>
          <span className={cn("wordmark truncate text-[13px]", expanded)}>
            {dict.admin.brand}
          </span>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? dict.admin.expand : dict.admin.collapse}
            className="ms-auto hidden size-8 shrink-0 place-items-center rounded-[var(--r-md)] text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)] lg:grid"
          >
            <Chevron
              className={cn("size-4 transition-transform", collapsed && "rotate-180")}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-4">
              <p
                className={cn(
                  "eyebrow px-2 py-2 text-[10px] text-[var(--ink-muted)]",
                  expanded,
                )}
              >
                {group.title}
              </p>
              {/* The rail replaces group labels with a rule. */}
              <div
                className={cn(
                  "my-2 h-px bg-[var(--line)]",
                  collapsed ? "" : "lg:hidden",
                )}
                aria-hidden
              />
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.key === active;
                  return (
                    <li key={item.key}>
                      <Link
                        href={href(item.path)}
                        title={item.label}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-[38px] items-center gap-2.5 rounded-[var(--r-md)] px-2 text-[13px] transition-colors",
                          isActive
                            ? "bg-[var(--aqua-soft)] font-bold text-[var(--aqua-ink)]"
                            : "text-[var(--ink)] hover:bg-[var(--surface-sunken)]",
                        )}
                      >
                        <Icon className="size-[18px] shrink-0" strokeWidth={1.5} />
                        <span className={cn("min-w-0 flex-1 truncate", expanded)}>
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span
                            className={cn(
                              "num shrink-0 rounded-[var(--r-full)] bg-[var(--aqua-soft)] px-2 text-[11px] font-semibold text-[var(--aqua-ink)]",
                              expanded,
                            )}
                          >
                            {count(item.badge, locale)}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-[var(--line)] px-4 py-3">
          <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[var(--aqua-soft)] text-[12px] font-semibold text-[var(--aqua-ink)]">
            {initials}
          </span>
          <span className={cn("min-w-0 flex-1", expanded)}>
            <span className="block truncate text-[13px] font-semibold">
              {session.name}
            </span>
            <span className="block truncate text-[11px] text-[var(--ink-muted)]">
              {roleLabel}
            </span>
          </span>
          <form action={signOut.bind(null, locale)} className={expanded}>
            <button
              type="submit"
              aria-label={dict.admin.signOut}
              title={dict.admin.signOut}
              className="grid size-8 place-items-center rounded-[var(--r-md)] text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--danger)]"
            >
              <LogOut className="size-4" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label={dict.nav.menu}
            className="-ms-2 grid size-10 place-items-center md:hidden"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="eyebrow text-[10px] text-[var(--ink-muted)]">
              {breadcrumb}
            </p>
            <h1 className="truncate text-[22px] leading-tight lg:text-[26px] [font-family:var(--font-display-family)]">
              {title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setPalette(true)}
            className="hidden min-h-9 items-center gap-2 rounded-[var(--r-md)] border border-[var(--line-strong)] px-3 text-[13px] text-[var(--ink-muted)] lg:flex"
          >
            <Search className="size-4" strokeWidth={1.5} />
            <span>{dict.admin.search}</span>
            <kbd className="rounded-[var(--r-sm)] bg-[var(--surface-sunken)] px-1.5 py-0.5 text-[11px] font-semibold">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setPalette(true)}
            aria-label={dict.admin.search}
            className="grid size-10 place-items-center lg:hidden"
          >
            <Search className="size-5" strokeWidth={1.5} />
          </button>

          <ThemeToggle className="hidden md:grid" />
          <LocaleToggle className="hidden md:block" />

          {showNewProduct ? (
            <MoLink
              href={href("/admin/products/new")}
              size="admin"
              className="hidden shrink-0 sm:inline-flex"
            >
              <Plus className="size-4" strokeWidth={2} />
              {dict.admin.newProduct}
            </MoLink>
          ) : null}
        </header>

        <div className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8">{children}</div>
      </div>

      {/* Mobile nav drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={dict.nav.close}
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-[var(--scrim)]"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.menu}
            className="absolute inset-y-0 start-0 flex w-[300px] max-w-[86%] flex-col bg-[var(--surface-raised)] shadow-[var(--shadow-overlay)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
              <span className="wordmark text-[13px]">{dict.admin.brand}</span>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label={dict.nav.close}
                className="grid size-10 place-items-center"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {groups.map((group) => (
                <div key={group.title} className="mb-4">
                  <p className="eyebrow px-2 py-2 text-[10px] text-[var(--ink-muted)]">
                    {group.title}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.key}>
                          <Link
                            href={href(item.path)}
                            className={cn(
                              "flex min-h-11 items-center gap-2.5 rounded-[var(--r-md)] px-2 text-sm",
                              item.key === active
                                ? "bg-[var(--aqua-soft)] font-bold text-[var(--aqua-ink)]"
                                : "hover:bg-[var(--surface-sunken)]",
                            )}
                          >
                            <Icon className="size-[18px]" strokeWidth={1.5} />
                            <span className="flex-1">{item.label}</span>
                            {item.badge ? (
                              <span className="num rounded-[var(--r-full)] bg-[var(--aqua-soft)] px-2 text-[11px] font-semibold text-[var(--aqua-ink)]">
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="flex items-center justify-between border-t border-[var(--line)] p-3">
              <LocaleToggle />
              <ThemeToggle />
              <form action={signOut.bind(null, locale)}>
                <button
                  type="submit"
                  aria-label={dict.admin.signOut}
                  className="grid size-10 place-items-center text-[var(--ink-muted)] hover:text-[var(--danger)]"
                >
                  <LogOut className="size-4" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bottom tab bar (phones) */}
      <nav
        aria-label={dict.nav.menu}
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--line)] bg-[var(--surface-raised)] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={href(item.path)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[11px]",
                isActive
                  ? "font-semibold text-[var(--aqua-ink)]"
                  : "text-[var(--ink-muted)]",
              )}
            >
              {isActive ? (
                <span
                  className="absolute inset-x-0 top-0 h-0.5 bg-[var(--aqua)]"
                  aria-hidden
                />
              ) : null}
              <Icon className="size-5" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
          className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[11px] text-[var(--ink-muted)]"
        >
          <MoreHorizontal className="size-5" strokeWidth={1.5} />
          {dict.admin.groupConfig}
        </button>
      </nav>

      {/* "More" sheet */}
      {more ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label={dict.nav.close}
            onClick={() => setMore(false)}
            className="absolute inset-0 bg-[var(--scrim)]"
          />
          <div
            ref={moreRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.admin.groupConfig}
            className="absolute inset-x-0 bottom-0 rounded-t-[var(--r-lg)] bg-[var(--surface-raised)] p-4 pb-20 shadow-[var(--shadow-overlay)]"
          >
            <ul className="flex flex-col gap-1">
              {groups
                .flatMap((g) => g.items)
                .filter((i) => !tabs.some((t) => t.key === i.key))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <Link
                        href={href(item.path)}
                        className="flex min-h-11 items-center gap-3 rounded-[var(--r-md)] px-3 text-sm"
                      >
                        <Icon className="size-[18px]" strokeWidth={1.5} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge ? (
                          <span className="num rounded-[var(--r-full)] bg-[var(--aqua-soft)] px-2 text-[11px] font-semibold text-[var(--aqua-ink)]">
                            {count(item.badge, locale)}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
              <LocaleToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}

      {/* Floating create action, above the tab bar, mirrors in RTL */}
      {showNewProduct ? (
        <MoLink
          href={href("/admin/products/new")}
          aria-label={dict.admin.newProduct}
          className="fixed bottom-20 end-4 z-30 grid size-13 place-items-center rounded-full p-0 shadow-[var(--shadow-overlay)] sm:hidden"
        >
          <Plus className="size-5" strokeWidth={2} />
        </MoLink>
      ) : null}

      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        products={products}
        orders={orders}
      />
    </div>
  );
}

export { MoButton };
