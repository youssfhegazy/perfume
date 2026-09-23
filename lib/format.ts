import type {
  Family,
  Locale,
  Product,
  ShippingMethod,
  Variant,
} from "./types";

/* ---------------------------------------------------------------------------
   Bidi isolation.

   Latin and numeric runs inside Arabic copy reverse without it: "100 مل"
   renders as "مل 100" and the currency lands on the wrong side. Every price,
   size, rating, stock count, quantity and order id goes through `iso()`.
   U+2068 FIRST STRONG ISOLATE … U+2069 POP DIRECTIONAL ISOLATE.
--------------------------------------------------------------------------- */

const FSI = "⁨";
const PDI = "⁩";

export function iso(value: string | number) {
  return `${FSI}${value}${PDI}`;
}

/** Western digits with thousands separators, in both locales. */
export function num(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

/** `3,450 EGP` / `‪3,450‬ ج.م` — currency always after the amount. */
export function money(n: number, locale: Locale) {
  const amount = num(n);
  return locale === "ar" ? `${iso(amount)} ج.م` : `${amount} EGP`;
}

/** Bare amount, isolated in Arabic. Use where the unit is rendered separately. */
export function amount(n: number, locale: Locale) {
  return locale === "ar" ? iso(num(n)) : num(n);
}

/** `50 ml` / `‪50‬ مل` */
export function ml(n: number, locale: Locale) {
  return locale === "ar" ? `${iso(n)} مل` : `${n} ml`;
}

export function rating(n: number, locale: Locale) {
  const v = n.toFixed(1);
  return locale === "ar" ? iso(v) : v;
}

export function count(n: number, locale: Locale) {
  return locale === "ar" ? iso(n) : String(n);
}

export function orderId(id: string, locale: Locale) {
  return locale === "ar" ? iso(id) : id;
}

export function formatDate(iso8601: string, locale: Locale) {
  const d = new Date(iso8601);
  const s = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
  return locale === "ar" ? s : s;
}

export function formatDateTime(iso8601: string, locale: Locale) {
  const d = new Date(iso8601);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/* ---------------------------------------------------------------------------
   Derived product values — never stored. See DATA_CONTRACTS.md.
--------------------------------------------------------------------------- */

export function displayName(p: Product, locale: Locale) {
  return locale === "ar" && p.ar ? p.ar : p.name;
}

/** The "from" price shown on cards. */
export function fromPrice(p: Product) {
  return p.variants.length ? Math.min(...p.variants.map((v) => v.p)) : 0;
}

/** Dashboard list price: the 50 ml variant, else the first. */
export function listPrice(p: Product) {
  return (p.variants.find((v) => v.ml === 50) ?? p.variants[0])?.p ?? 0;
}

export function totalStock(p: Product) {
  return p.variants.reduce((s, v) => s + v.stock, 0);
}

export function isSoldOut(p: Product) {
  return p.variants.length === 0 || p.variants.every((v) => v.stock === 0);
}

/** PDP default variant: 50 ml, else the first in stock, else the first. */
export function defaultVariant(p: Product): Variant | undefined {
  return (
    p.variants.find((v) => v.ml === 50) ??
    p.variants.find((v) => v.stock > 0) ??
    p.variants[0]
  );
}

export function variantOf(p: Product, mlSize: number) {
  return p.variants.find((v) => v.ml === mlSize);
}

/** "Only N left" shows between 1 and 4 units. */
export function isLow(stock: number) {
  return stock > 0 && stock < 5;
}

export function isLive(p: Product) {
  return p.status === "live";
}

/* ---------------------------------------------------------------------------
   Family accents. Each family gets one accent, used only inside its badge and
   the 2px top border on the family tile.
--------------------------------------------------------------------------- */

export const FAMILY_ACCENT: Record<
  Family,
  { accent: string; soft: string; fg: string }
> = {
  woody: { accent: "var(--deep)", soft: "var(--aqua-soft)", fg: "var(--aqua-ink)" },
  floral: { accent: "var(--rose)", soft: "var(--danger-soft)", fg: "var(--rose)" },
  amber: {
    accent: "var(--warning)",
    soft: "var(--warning-soft)",
    fg: "var(--warning)",
  },
  fresh: { accent: "var(--aqua)", soft: "var(--aqua-soft)", fg: "var(--aqua-ink)" },
  musk: { accent: "var(--aqua)", soft: "var(--aqua-soft)", fg: "var(--aqua-ink)" },
  spicy: {
    accent: "var(--warning)",
    soft: "var(--warning-soft)",
    fg: "var(--warning)",
  },
};

export const FAMILIES: Family[] = [
  "woody",
  "floral",
  "amber",
  "fresh",
  "musk",
  "spicy",
];

export const CONCENTRATIONS = ["EDP", "Elixir", "Extrait"] as const;

/* ---------------------------------------------------------------------------
   Pricing. Applied in this order — see DATA_CONTRACTS.md.
--------------------------------------------------------------------------- */

export const FREE_DELIVERY_THRESHOLD = 2000;
export const STANDARD_SHIPPING = 70;
export const EXPRESS_SHIPPING = 120;
export const GIFT_WRAP_FEE = 150;
export const COD_FEE = 30;

export function shippingFor(
  subtotal: number,
  method: ShippingMethod,
  zoneFee: number = STANDARD_SHIPPING,
) {
  if (method === "express") return EXPRESS_SHIPPING;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : zoneFee;
}

export function discountFor(subtotal: number, pct: number | null) {
  return pct ? Math.round((subtotal * pct) / 100) : 0;
}

export interface TotalsInput {
  subtotal: number;
  couponPct?: number | null;
  shippingMethod?: ShippingMethod;
  zoneFee?: number;
  giftWrap?: boolean;
  cod?: boolean;
}

export function computeTotals({
  subtotal,
  couponPct = null,
  shippingMethod = "standard",
  zoneFee = STANDARD_SHIPPING,
  giftWrap = false,
  cod = false,
}: TotalsInput) {
  const discount = discountFor(subtotal, couponPct);
  const shipping = shippingFor(subtotal, shippingMethod, zoneFee);
  const wrap = giftWrap ? GIFT_WRAP_FEE : 0;
  const codFee = cod ? COD_FEE : 0;
  return {
    subtotal,
    discount,
    shipping,
    giftWrap: wrap,
    codFee,
    total: subtotal - discount + shipping + wrap + codFee,
  };
}

/** Progress of the bag's free-delivery meter, 0–100. */
export function deliveryProgress(subtotal: number) {
  return Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
}

/** Slug for the per-note image well in public/images/notes. */
export function noteSlug(nameEn: string) {
  return nameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
