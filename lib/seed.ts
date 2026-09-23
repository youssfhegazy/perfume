/* Seed catalogue, transcribed from design_handoff_maison_oud/mo-store.js plus
   the order / coupon / zone tables in DATA_CONTRACTS.md.

   The data itself lives in seed.json so `scripts/sanity-seed.mjs` can push the
   exact same records into Sanity without a second copy. This module only types
   it. It is the fallback the app runs on when Sanity is not configured — not a
   runtime store; see lib/data.ts. */

import seed from "./seed.json";
import type {
  Catalog,
  Coupon,
  Order,
  Product,
  ShippingZone,
  Subscriber,
  Testimonial,
} from "./types";

/* JSON widens tuples and string unions, so each export is asserted back to its
   domain type. seed.json is generated from these same shapes — see the README. */
export const PRODUCTS = seed.products as unknown as Product[];
export const TESTIMONIALS = seed.testimonials as unknown as Testimonial[];
export const ORDERS = seed.orders as unknown as Order[];
export const COUPONS = seed.coupons as unknown as Coupon[];
export const ZONES = seed.zones as unknown as ShippingZone[];
export const SUBSCRIBERS = seed.subscribers as unknown as Subscriber[];

export const SEED: Catalog = {
  products: PRODUCTS,
  testimonials: TESTIMONIALS,
  orders: ORDERS,
  coupons: COUPONS,
  zones: ZONES,
  subscribers: SUBSCRIBERS,
};

/** A fresh copy — callers mutate their own catalogue, never the seed. */
export function cloneSeed(): Catalog {
  return structuredClone(SEED);
}
