"use client";

import { MoLink } from "@/components/brand/button";
import { EmptyState } from "@/components/brand/primitives";
import { RevealGroup, RevealItem } from "@/components/brand/reveal";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { ProductCard } from "@/components/store/product-card";
import { count } from "@/lib/format";
import { plural } from "@/lib/i18n/dictionary";
import { useHydrated } from "@/lib/hooks/use-persisted-state";

/* The wishlist is per-device client state, so the page renders from the
   provider rather than the server. Until hydration it shows nothing rather
   than a wrong empty state. */

export function WishlistView() {
  const { dict, locale, href } = useLocale();
  const { wishlist, products, toggleWishlist } = useCart();
  const hydrated = useHydrated();

  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="shell page-x py-10 lg:py-16">
      <header className="mb-10 flex flex-col gap-3">
        <h1 className="display-lg">{dict.wishlist.title}</h1>
        <p className="text-base text-[var(--ink-muted)]">
          {dict.wishlist.intro}
        </p>
        {hydrated && saved.length > 0 ? (
          <div className="flex flex-wrap items-center gap-4">
            <p className="num text-[13px] text-[var(--ink-muted)]">
              {count(saved.length, locale)}{" "}
              {plural(dict.wishlist.count, saved.length, locale)}
            </p>
            <button
              type="button"
              onClick={() => saved.forEach((p) => toggleWishlist(p.id))}
              className="text-[13px] text-[var(--aqua-ink)] underline decoration-[var(--aqua)] underline-offset-4"
            >
              {dict.wishlist.clear}
            </button>
          </div>
        ) : null}
      </header>

      {!hydrated ? (
        <div
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
          aria-hidden
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] w-full animate-pulse bg-[var(--surface-sunken)]"
            />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <EmptyState
          title={dict.wishlist.empty}
          body={dict.wishlist.emptyBody}
          action={
            <MoLink href={href("/collection")} variant="outline">
              {dict.wishlist.emptyCta}
            </MoLink>
          }
        />
      ) : (
        <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {saved.map((p, i) => (
            <RevealItem key={p.id}>
              <ProductCard product={p} priority={i < 4} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}

