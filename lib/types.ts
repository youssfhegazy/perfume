/* Domain types. Mirrors design_handoff_maison_oud/DATA_CONTRACTS.md. */

export type Locale = "en" | "ar";

export type Family =
  | "woody"
  | "floral"
  | "amber"
  | "fresh"
  | "musk"
  | "spicy";

export type Concentration = "EDP" | "Elixir" | "Extrait";

export type ProductStatus = "live" | "draft" | "archived";

export type Season =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "day"
  | "evening"
  | "night";

export interface LocaleString {
  en: string;
  ar: string;
}

export interface Variant {
  ml: number;
  p: number;
  stock: number;
}

/* A single note in the scent pyramid. An object, not an [en, ar] tuple:
   Sanity returns objects and a tuple would only agree with the seed. */
export interface ScentNote {
  en: string;
  ar: string;
}

/** An uploaded or seeded product image. */
export interface GalleryImage {
  url: string;
  alt?: LocaleString | null;
}

export interface Product {
  id: string;
  name: string;
  ar: string;
  sku: string;
  fam: Family;
  conc: Concentration;
  rating: number;
  reviews: number;
  status: ProductStatus;
  badge: LocaleString | null;
  variants: Variant[];
  desc: LocaleString;
  notes: { top: ScentNote[]; heart: ScentNote[]; base: ScentNote[] };
  lon: number;
  sil: number;
  seasons: Season[];
  hint: string;
  /** Merchandising tags. Set from the editor or the bulk action. */
  tags: string[];
  /** Uploaded imagery. Falls back to the seeded packshots when empty. */
  gallery: GalleryImage[];
}

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface Testimonial {
  id: string;
  status: TestimonialStatus;
  stars: 1 | 2 | 3 | 4 | 5;
  product: string;
  author: LocaleString;
  location: LocaleString;
  body: LocaleString;
  /** The house's public reply, shown under the quote. */
  reply: LocaleString | null;
}

export type OrderStatus =
  | "new"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "card" | "wallet";

/* Where the money is, independently of where the parcel is.
   `due` is cash on delivery that has not been collected yet. */
export type PaymentStatus = "due" | "pending" | "paid" | "refunded" | "failed";
export type ShippingMethod = "standard" | "express";

export type GovernorateId =
  | "cairo"
  | "giza"
  | "alex"
  | "dakahlia"
  | "sharqia"
  | "luxor"
  | "aswan"
  | "redsea";

export interface OrderItem {
  productId: string;
  ml: number;
  qty: number;
  /** Captured at purchase — never re-read from the product. */
  unitPrice: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  giftWrap: number;
  codFee: number;
  total: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  placedAt: string;
  customer: { name: string; phone: string; email: string };
  address: { governorate: GovernorateId; street: string };
  items: OrderItem[];
  shipping: ShippingMethod;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  giftWrap: boolean;
  coupon: string | null;
  totals: OrderTotals;
}

export interface Coupon {
  id: string;
  code: string;
  pct: number;
  /** Redemptions so far. Incremented when an order is placed. */
  used: number;
  on: boolean;
  /** Maximum redemptions. null = unlimited. */
  usageLimit: number | null;
  /** Minimum subtotal in EGP before the code applies. */
  minOrder: number | null;
  /** ISO dates. null = no bound. */
  startsAt: string | null;
  endsAt: string | null;
}

export interface ShippingZone {
  id: GovernorateId;
  gov: LocaleString;
  fee: number;
  eta: LocaleString;
  cod: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  locale: Locale;
  createdAt: string;
}

/** Everything the storefront and dashboard read. */
export interface Catalog {
  products: Product[];
  testimonials: Testimonial[];
  orders: Order[];
  coupons: Coupon[];
  zones: ShippingZone[];
  subscribers: Subscriber[];
}

/** A line in the client-side bag. */
export interface CartLine {
  productId: string;
  ml: number;
  qty: number;
}
