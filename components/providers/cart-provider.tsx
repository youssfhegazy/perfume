"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { variantOf } from "@/lib/format";
import type { CartLine, Product } from "@/lib/types";

/* Cart, wishlist and drawer state. Cart and wishlist persist; drawer state and
   the "just added" pulse do not. The catalogue is passed in from the server so
   line items can resolve price and stock without another fetch. */

interface ResolvedLine extends CartLine {
  product: Product;
  unitPrice: number;
  lineTotal: number;
  stock: number;
}

interface CartValue {
  lines: CartLine[];
  resolved: ResolvedLine[];
  count: number;
  subtotal: number;
  add: (productId: string, ml: number, qty?: number) => void;
  setQty: (productId: string, ml: number, qty: number) => void;
  remove: (productId: string, ml: number) => void;
  clear: () => void;

  giftWrap: boolean;
  setGiftWrap: (v: boolean) => void;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWished: (productId: string) => boolean;

  open: boolean;
  setOpen: (v: boolean) => void;
  /** Increments whenever a line is added — drives the bag-count pop. */
  pulse: number;

  products: Product[];
}

const Ctx = createContext<CartValue | null>(null);

/* Module constants: usePersistedState uses these as the server snapshot, so
   they must be referentially stable across renders. */
const NO_LINES: CartLine[] = [];
const NO_WISHES: string[] = [];

export function CartProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  const [lines, setLines] = usePersistedState<CartLine[]>("mo:cart", NO_LINES);
  const [wishlist, setWishlist] = usePersistedState<string[]>(
    "mo:wishlist",
    NO_WISHES,
  );
  const [giftWrap, setGiftWrap] = usePersistedState<boolean>("mo:giftwrap", false);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);

  const add = useCallback(
    (productId: string, ml: number, qty = 1) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.productId === productId && l.ml === ml);
        if (i === -1) return [...prev, { productId, ml, qty }];
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      });
      setPulse((n) => n + 1);
      setOpen(true);
    },
    [setLines],
  );

  const setQty = useCallback(
    (productId: string, ml: number, qty: number) => {
      setLines((prev) =>
        qty <= 0
          ? prev.filter((l) => !(l.productId === productId && l.ml === ml))
          : prev.map((l) =>
              l.productId === productId && l.ml === ml ? { ...l, qty } : l,
            ),
      );
    },
    [setLines],
  );

  const remove = useCallback(
    (productId: string, ml: number) => {
      setLines((prev) =>
        prev.filter((l) => !(l.productId === productId && l.ml === ml)),
      );
    },
    [setLines],
  );

  const clear = useCallback(() => setLines([]), [setLines]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId],
      );
    },
    [setWishlist],
  );

  const resolved = useMemo<ResolvedLine[]>(() => {
    return lines.flatMap((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return [];
      const variant = variantOf(product, line.ml);
      if (!variant) return [];
      return [
        {
          ...line,
          product,
          unitPrice: variant.p,
          lineTotal: variant.p * line.qty,
          stock: variant.stock,
        },
      ];
    });
  }, [lines, products]);

  const value: CartValue = {
    lines,
    resolved,
    count: resolved.reduce((n, l) => n + l.qty, 0),
    subtotal: resolved.reduce((n, l) => n + l.lineTotal, 0),
    add,
    setQty,
    remove,
    clear,
    giftWrap,
    setGiftWrap,
    wishlist,
    toggleWishlist,
    isWished: (id) => wishlist.includes(id),
    open,
    setOpen,
    pulse,
    products,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
