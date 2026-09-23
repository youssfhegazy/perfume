"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { MerchBadge } from "@/components/brand/primitives";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  count,
  defaultVariant,
  displayName,
  fromPrice,
  isLow,
  isSoldOut,
  money,
} from "@/lib/format";
import { t } from "@/lib/i18n/dictionary";
import { productImage } from "@/lib/images";
import type { Product } from "@/lib/types";
import Image from "next/image";

/* The grid tile for PLP, home carousels and related products.

   The image stage is `aspect-ratio` on `align-self:start` with `min-width:0`.
   Without those the box stretches to its grid row and blows the track out at
   narrow widths — that was the cause of every overflow bug in the prototype. */

export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw",
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
}) {
  const { locale, dict, href } = useLocale();
  const { add, toggleWishlist, isWished } = useCart();

  const soldOut = isSoldOut(product);
  const variant = defaultVariant(product);
  const price = fromPrice(product);
  const wished = isWished(product.id);
  const low = variant ? isLow(variant.stock) : false;

  const badgeLabel = soldOut
    ? dict.pdp.soldOut
    : product.badge
      ? product.badge[locale]
      : null;

  return (
    <article className="group/card flex min-w-0 flex-col">
      <div className="relative">
        <Link
          href={href(`/product/${product.id}`)}
          className="stage block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
          aria-label={displayName(product, locale)}
        >
          <Image
            src={productImage(product)}
            alt={displayName(product, locale)}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-[420ms] ease-[var(--ease-scent)] group-hover/card:scale-[1.04]",
              soldOut && "opacity-60",
            )}
          />
        </Link>

        {badgeLabel ? (
          <span className="pointer-events-none absolute top-3 start-3 z-10">
            <MerchBadge tone={soldOut ? "danger" : "surface"}>
              {badgeLabel}
            </MerchBadge>
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={dict.pdp.wishlist}
          aria-pressed={wished}
          className="absolute top-3 end-3 z-10 grid size-8 place-items-center rounded-full bg-[var(--surface-raised)] text-[var(--ink)] shadow-[var(--shadow-soft)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        >
          <Heart
            className={cn(
              "size-4",
              wished && "fill-[var(--rose)] text-[var(--rose)]",
            )}
            strokeWidth={1.5}
          />
        </button>

        {/* Quick add slides up from the bottom of the image on hover. */}
        <button
          type="button"
          disabled={soldOut}
          onClick={() => variant && add(product.id, variant.ml)}
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 flex min-h-11 items-center justify-center text-sm font-semibold",
            "translate-y-2 opacity-0 transition-[opacity,transform] duration-[420ms] ease-[var(--ease-scent)]",
            "group-hover/card:translate-y-0 group-hover/card:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--focus)]",
            soldOut
              ? "bg-[var(--surface-raised)] text-[var(--ink)]"
              : "bg-[var(--primary-c)] text-[var(--on-primary)]",
          )}
        >
          {soldOut ? dict.pdp.notifyMe : dict.pdp.addToBag}
        </button>
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-0.5">
        <Link
          href={href(`/product/${product.id}`)}
          className="group/name relative inline-block w-fit max-w-full"
        >
          <span className="display-lg block text-[24px] leading-tight">
            {displayName(product, locale)}
          </span>
          <span
            aria-hidden
            className="absolute -bottom-0.5 start-0 h-px w-0 bg-[var(--aqua)] transition-[width] duration-[420ms] ease-[var(--ease-scent)] group-hover/card:w-full"
          />
        </Link>

        <p className="text-[13px] text-[var(--ink-muted)]">
          {dict.families[product.fam]} · {product.conc}
        </p>

        <p className="num mt-1 text-[17px] font-semibold">
          <span className="sr-only">{dict.common.from} </span>
          {money(price, locale)}
        </p>

        {low && !soldOut ? (
          <p className="num text-[13px] text-[var(--warning)]">
            {t(dict.pdp.onlyLeft, { n: count(variant!.stock, locale) })}
          </p>
        ) : null}
      </div>
    </article>
  );
}
