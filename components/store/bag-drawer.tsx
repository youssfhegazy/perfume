"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";

import { MoButton } from "@/components/brand/button";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  defaultVariant,
  deliveryProgress,
  displayName,
  FREE_DELIVERY_THRESHOLD,
  isSoldOut,
  ml as mlFmt,
  money,
} from "@/lib/format";
import { useFocusTrap, useScrollLock } from "@/lib/hooks/use-focus-trap";
import { t } from "@/lib/i18n/dictionary";
import { productImage } from "@/lib/images";
import { dur, ease } from "@/lib/motion";

export function BagDrawer() {
  const { dict, locale, href, isRtl } = useLocale();
  const {
    open,
    setOpen,
    resolved,
    subtotal,
    setQty,
    remove,
    add,
    giftWrap,
    setGiftWrap,
    products,
  } = useCart();

  const panelRef = useFocusTrap<HTMLElement>(open);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const inBag = new Set(resolved.map((l) => l.productId));
  const upsell = useMemo(
    () =>
      products
        .filter((p) => p.status === "live" && !inBag.has(p.id) && !isSoldOut(p))
        .slice(0, 2),
    // `inBag` is derived from `resolved`, which is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, resolved],
  );

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const met = remaining === 0;
  const progress = deliveryProgress(subtotal);

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
            transition={{ duration: dur.base, ease: ease.scent }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[var(--scrim)]"
          />

          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={dict.bag.title}
            initial={{ x: isRtl ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? "-100%" : "100%" }}
            transition={{ duration: dur.base, ease: ease.scent }}
            className="absolute inset-y-0 end-0 flex w-full max-w-[440px] flex-col bg-[var(--surface-raised)] shadow-[var(--shadow-overlay)] sm:w-[440px]"
          >
            <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <h2 className="heading-sm text-[24px]">{dict.bag.title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.nav.close}
                className="grid min-h-11 w-11 place-items-center"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </header>

            {resolved.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="heading-sm text-[26px]">{dict.bag.empty}</p>
                <p className="text-sm text-[var(--ink-muted)]">
                  {dict.bag.emptyBody}
                </p>
                <Link
                  href={href("/collection")}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-sm)] bg-[var(--primary-c)] px-6 text-sm font-semibold text-[var(--on-primary)] transition-colors hover:bg-[var(--aqua-ink)]"
                >
                  {dict.bag.emptyCta}
                </Link>
              </div>
            ) : (
              <>
                {/* Free-delivery meter */}
                <div className="flex flex-col gap-2 border-b border-[var(--line)] px-5 py-4">
                  <p
                    className={cn(
                      "text-[13px]",
                      met
                        ? "font-semibold text-[var(--success)]"
                        : "text-[var(--ink-muted)]",
                    )}
                  >
                    {met
                      ? dict.bag.freeDeliveryMet
                      : t(dict.bag.freeDeliveryShort, {
                          amount: money(remaining, locale),
                        })}
                  </p>
                  <div
                    className="h-[3px] w-full bg-[var(--surface-sunken)]"
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={dict.bag.freeDeliveryMet}
                  >
                    <motion.div
                      className="h-full bg-[var(--aqua)]"
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: dur.base, ease: ease.scent }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5">
                  <ul className="divide-y divide-[var(--line)]">
                    {resolved.map((line) => (
                      <li
                        key={`${line.productId}-${line.ml}`}
                        className="flex gap-4 py-4"
                      >
                        <Link
                          href={href(`/product/${line.productId}`)}
                          onClick={() => setOpen(false)}
                          className="relative h-[105px] w-[84px] shrink-0 overflow-hidden bg-[var(--surface-sunken)]"
                        >
                          <Image
                            src={productImage(line.product)}
                            alt={displayName(line.product, locale)}
                            fill
                            sizes="84px"
                            className="object-cover"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={href(`/product/${line.productId}`)}
                              onClick={() => setOpen(false)}
                              className="heading-sm text-[20px] leading-snug"
                            >
                              {displayName(line.product, locale)}
                            </Link>
                            <button
                              type="button"
                              onClick={() => remove(line.productId, line.ml)}
                              className="shrink-0 text-[12px] text-[var(--ink-muted)] underline decoration-[var(--aqua)] underline-offset-4 hover:text-[var(--danger)]"
                            >
                              {dict.bag.remove}
                            </button>
                          </div>

                          <p className="text-[13px] text-[var(--ink-muted)]">
                            {mlFmt(line.ml, locale)} ·{" "}
                            {dict.families[line.product.fam]}
                          </p>

                          <div className="mt-1 flex items-center justify-between gap-2">
                            <div className="flex items-center border border-[var(--line-strong)]">
                              <button
                                type="button"
                                aria-label={dict.bag.decrease}
                                onClick={() =>
                                  setQty(line.productId, line.ml, line.qty - 1)
                                }
                                className="grid size-9 place-items-center"
                              >
                                <Minus className="size-3.5" strokeWidth={1.5} />
                              </button>
                              <span className="num w-8 text-center text-sm font-semibold">
                                {line.qty}
                              </span>
                              <button
                                type="button"
                                aria-label={dict.bag.increase}
                                onClick={() =>
                                  setQty(line.productId, line.ml, line.qty + 1)
                                }
                                className="grid size-9 place-items-center"
                              >
                                <Plus className="size-3.5" strokeWidth={1.5} />
                              </button>
                            </div>
                            <span className="num text-sm font-semibold">
                              {money(line.lineTotal, locale)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {upsell.length ? (
                    <section className="border-t border-[var(--line)] py-4">
                      <h3 className="eyebrow mb-3 text-[var(--aqua-ink)]">
                        {dict.bag.upsell}
                      </h3>
                      <ul className="flex flex-col gap-3">
                        {upsell.map((p) => {
                          const v = defaultVariant(p);
                          return (
                            <li key={p.id} className="flex items-center gap-3">
                              <div className="relative h-[55px] w-[44px] shrink-0 overflow-hidden bg-[var(--surface-sunken)]">
                                <Image
                                  src={productImage(p)}
                                  alt={displayName(p, locale)}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {displayName(p, locale)}
                                </p>
                                <p className="num text-[13px] text-[var(--ink-muted)]">
                                  {v ? money(v.p, locale) : null}
                                </p>
                              </div>
                              <MoButton
                                size="chip"
                                variant="subtle"
                                onClick={() => v && add(p.id, v.ml)}
                              >
                                {dict.bag.add}
                              </MoButton>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ) : null}
                </div>

                <footer className="flex flex-col gap-3 border-t border-[var(--line)] px-5 py-4">
                  <label className="flex cursor-pointer items-center gap-3 bg-[var(--pearl)] px-3 py-2.5 text-[13px] text-[#10262b]">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="size-4 accent-[var(--primary-c)]"
                    />
                    <span className="flex-1">{dict.bag.giftWrap}</span>
                    <span className="num font-semibold">
                      {dict.bag.giftWrapPrice}
                    </span>
                  </label>

                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-semibold">
                      {dict.bag.subtotal}
                    </span>
                    <span className="num text-base font-semibold">
                      {money(subtotal, locale)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--ink-muted)]">
                    {dict.bag.taxNote}
                  </p>

                  <Link
                    href={href("/checkout")}
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--r-sm)] bg-[var(--primary-c)] px-6 text-sm font-semibold text-[var(--on-primary)] transition-colors hover:bg-[var(--aqua-ink)]"
                  >
                    {dict.bag.checkout}
                  </Link>
                  <MoButton
                    variant="ghost"
                    block
                    onClick={() => setOpen(false)}
                  >
                    {dict.bag.keepShopping}
                  </MoButton>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
