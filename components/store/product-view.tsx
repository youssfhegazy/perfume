"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Minus, Plus } from "lucide-react";

import { MoButton } from "@/components/brand/button";
import {
  MerchBadge,
  Overline,
  RatingLine,
  SegmentMeter,
} from "@/components/brand/primitives";
import { ImageReveal, Reveal, RevealGroup, RevealItem } from "@/components/brand/reveal";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { ProductCard } from "@/components/store/product-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  count,
  defaultVariant,
  displayName,
  FAMILY_ACCENT,
  isLow,
  isSoldOut,
  ml as mlFmt,
  money,
} from "@/lib/format";
import { t } from "@/lib/i18n/dictionary";
import { noteImage, productGallery } from "@/lib/images";
import { dur, ease, tierStagger } from "@/lib/motion";
import type { Product, ScentNote } from "@/lib/types";

export function ProductView({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { dict, locale, href } = useLocale();
  const { add, toggleWishlist, isWished } = useCart();
  const reduced = useReducedMotion();

  const gallery = productGallery(product);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedMl, setSelectedMl] = useState(
    () => defaultVariant(product)?.ml ?? product.variants[0]?.ml ?? 50,
  );
  const [qty, setQty] = useState(1);

  const variant = product.variants.find((v) => v.ml === selectedMl);
  const soldOut = isSoldOut(product) || (variant?.stock ?? 0) === 0;
  const low = variant ? isLow(variant.stock) : false;
  const accent = FAMILY_ACCENT[product.fam];
  const wished = isWished(product.id);

  const tiers: Array<{
    key: "top" | "heart" | "base";
    label: string;
    notes: ScentNote[];
  }> = [
    { key: "top", label: dict.pdp.top, notes: product.notes.top },
    { key: "heart", label: dict.pdp.heart, notes: product.notes.heart },
    { key: "base", label: dict.pdp.base, notes: product.notes.base },
  ];

  function addToBag() {
    if (!variant || soldOut) return;
    add(product.id, variant.ml, qty);
  }

  return (
    <div className="shell page-x py-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
        {/* Gallery */}
        <div className="flex min-w-0 flex-col gap-3">
          <ImageReveal className="stage">
            <Image
              key={gallery[activeImage]}
              src={gallery[activeImage]}
              alt={`${displayName(product, locale)} — ${t(dict.pdp.viewImage, { n: activeImage + 1 })}`}
              fill
              sizes="(min-width:1024px) 55vw, 100vw"
              priority
              className="object-cover"
            />
          </ImageReveal>

          <ul
            className="grid grid-cols-4 gap-3"
            aria-label={dict.pdp.gallery}
          >
            {gallery.map((src, i) => (
              <li key={src} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={t(dict.pdp.viewImage, { n: i + 1 })}
                  aria-current={i === activeImage}
                  className={cn(
                    "stage block w-full border-2 transition-colors",
                    i === activeImage
                      ? "border-[var(--aqua)]"
                      : "border-transparent",
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="14vw"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <span
            className="micro w-fit rounded-[var(--r-sm)] px-2 py-1"
            style={{ background: accent.soft, color: accent.fg }}
          >
            {dict.families[product.fam]}
          </span>

          <RatingLine
            rating={product.rating}
            reviews={product.reviews}
            locale={locale}
            reviewsLabel={dict.pdp.reviews}
          />

          <h1 className="display-lg">{displayName(product, locale)}</h1>

          <p className="max-w-[48ch] text-base leading-relaxed text-[var(--ink-muted)]">
            {product.desc[locale]}
          </p>

          <p className="num text-[24px] font-semibold">
            {variant ? money(variant.p, locale) : null}
          </p>

          {/* Size selector */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-[13px] font-semibold">
              {dict.pdp.size}
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const out = v.stock === 0;
                const selected = v.ml === selectedMl;
                return (
                  <button
                    key={v.ml}
                    type="button"
                    disabled={out}
                    onClick={() => setSelectedMl(v.ml)}
                    aria-pressed={selected}
                    className={cn(
                      "flex min-h-11 min-w-24 flex-col items-center justify-center rounded-[var(--r-sm)] border px-3 py-1.5",
                      selected
                        ? "border-[var(--primary-c)] bg-[var(--aqua-soft)]"
                        : "border-[var(--line-strong)]",
                      out && "opacity-45",
                    )}
                  >
                    <span className="num text-sm font-semibold">
                      {mlFmt(v.ml, locale)}
                    </span>
                    <span className="num text-[12px] text-[var(--ink-muted)]">
                      {money(v.p, locale)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Quantity + add */}
          <div className="flex flex-wrap items-stretch gap-3">
            <div className="flex items-center border border-[var(--line-strong)]">
              <button
                type="button"
                aria-label={dict.bag.decrease}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid size-11 place-items-center"
              >
                <Minus className="size-4" strokeWidth={1.5} />
              </button>
              <span className="num w-10 text-center text-sm font-semibold">
                {qty}
              </span>
              <button
                type="button"
                aria-label={dict.bag.increase}
                onClick={() => setQty((q) => q + 1)}
                className="grid size-11 place-items-center"
              >
                <Plus className="size-4" strokeWidth={1.5} />
              </button>
            </div>

            <MoButton
              onClick={addToBag}
              disabled={soldOut}
              className="min-w-[180px] flex-1"
            >
              {soldOut ? dict.pdp.notifyMe : dict.pdp.addToBag}
            </MoButton>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={dict.pdp.wishlist}
              aria-pressed={wished}
              className="grid size-11 shrink-0 place-items-center rounded-[var(--r-sm)] border border-[var(--line-strong)]"
            >
              <Heart
                className={cn(
                  "size-4",
                  wished && "fill-[var(--rose)] text-[var(--rose)]",
                )}
                strokeWidth={1.5}
              />
            </button>
          </div>

          <p
            className={cn(
              "text-[13px] font-semibold",
              soldOut
                ? "text-[var(--danger)]"
                : low
                  ? "text-[var(--warning)]"
                  : "text-[var(--success)]",
            )}
          >
            {soldOut
              ? dict.pdp.soldOut
              : low
                ? t(dict.pdp.onlyLeft, { n: count(variant!.stock, locale) })
                : dict.pdp.inStock}
          </p>
          <p className="text-[13px] text-[var(--ink-muted)]">
            {dict.pdp.shippingNote}
          </p>

          {/* Single-open: Base UI opens many by default. */}
          <Accordion multiple={false} className="mt-2 w-full">
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-sm font-semibold">
                {dict.pdp.accordionShipping}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[var(--ink-muted)]">
                {dict.pdp.accordionShippingBody}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wear">
              <AccordionTrigger className="text-sm font-semibold">
                {dict.pdp.accordionWear}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[var(--ink-muted)]">
                {dict.pdp.accordionWearBody}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ingredients">
              <AccordionTrigger className="text-sm font-semibold">
                {dict.pdp.accordionIngredients}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[var(--ink-muted)]">
                {dict.pdp.accordionIngredientsBody}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Notes & accords — tiers stagger 150ms apart */}
      <section className="rhythm">
        <Reveal className="mb-8">
          <h2 className="heading">{dict.pdp.notesTitle}</h2>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {tiers.map((tier, ti) => (
            <motion.div
              key={tier.key}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: dur.slow,
                ease: ease.scent,
                delay: reduced ? 0 : ti * tierStagger,
              }}
              className="flex min-w-0 flex-col gap-4"
            >
              <Overline className="w-fit border-b border-[var(--aqua)] pb-1">
                {tier.label}
              </Overline>
              <ul className="flex flex-col gap-3">
                {tier.notes.map((note) => (
                  <li key={note.en} className="flex items-center gap-3">
                    <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-[var(--surface-sunken)]">
                      <Image
                        src={noteImage(note.en)}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <span className="text-[20px] leading-snug [font-family:var(--font-display-family)]">
                      {locale === "ar" ? note.ar : note.en}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <Reveal className="mt-12 grid gap-8 md:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-5">
            <SegmentMeter
              value={product.lon}
              label={dict.pdp.longevity}
              locale={locale}
            />
            <SegmentMeter
              value={product.sil}
              label={dict.pdp.sillage}
              locale={locale}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold">{dict.pdp.wearIt}</span>
            <ul className="flex flex-wrap gap-2">
              {product.seasons.map((s) => (
                <li
                  key={s}
                  className="rounded-[var(--r-full)] bg-[var(--surface-sunken)] px-3 py-1.5 text-[13px]"
                >
                  {dict.seasons[s]}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Related */}
      {related.length ? (
        <section className="rhythm pt-0">
          <Reveal className="mb-8">
            <h2 className="heading">{dict.pdp.related}</h2>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <RevealItem key={p.id}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {/* Mobile sticky add-to-bag */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-[var(--line)] bg-[var(--surface-raised)] px-4 py-3 lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">
            {displayName(product, locale)} · {mlFmt(selectedMl, locale)}
          </p>
          <p className="num text-[13px] text-[var(--ink-muted)]">
            {variant ? money(variant.p, locale) : null}
          </p>
        </div>
        <MoButton onClick={addToBag} disabled={soldOut} className="shrink-0">
          {soldOut ? dict.pdp.notifyMe : dict.pdp.addToBag}
        </MoButton>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />

      <Link href={href("/collection")} className="sr-only">
        {dict.plp.title}
      </Link>
    </div>
  );
}

/** Badge shown above the gallery when the product carries one. */
export function ProductBadge({ product }: { product: Product }) {
  const { locale, dict } = useLocale();
  if (isSoldOut(product))
    return <MerchBadge tone="danger">{dict.pdp.soldOut}</MerchBadge>;
  if (!product.badge) return null;
  return <MerchBadge>{product.badge[locale]}</MerchBadge>;
}
