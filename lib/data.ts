import "server-only";

import { readClient } from "@/sanity/lib/client";
import { sanityConfigured } from "@/sanity/lib/env";
import {
  allCouponsQuery,
  allOrdersQuery,
  allProductsQuery,
  allTestimonialsQuery,
  allSubscribersQuery,
  allZonesQuery,
} from "@/sanity/lib/queries";

import { memoryCatalog } from "./store/memory";
import type {
  Catalog,
  Coupon,
  Order,
  Product,
  ShippingZone,
  Subscriber,
  Testimonial,
} from "./types";

/* The single read path for both surfaces. Sanity when it is configured, the
   in-process seed catalogue otherwise, so nothing upstream branches on it. */

export function usingSanity() {
  return sanityConfigured;
}

async function fromSanity<T>(query: string, fallback: T): Promise<T> {
  const client = readClient();
  if (!client) return fallback;
  try {
    return (await client.fetch(query, {}, {
      next: { revalidate: 60, tags: ["catalog"] },
    })) as T;
  } catch (err) {
    console.error("[sanity] read failed, falling back to seed:", err);
    return fallback;
  }
}

export async function getProducts(): Promise<Product[]> {
  return fromSanity(allProductsQuery, memoryCatalog().products);
}

export async function getLiveProducts(): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.status === "live");
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.id === id);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return fromSanity(allTestimonialsQuery, memoryCatalog().testimonials);
}

export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  return (await getTestimonials()).filter((t) => t.status === "approved");
}

export async function getOrders(): Promise<Order[]> {
  return fromSanity(allOrdersQuery, memoryCatalog().orders);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  return (await getOrders()).find((o) => o.id === id);
}

export async function getCoupons(): Promise<Coupon[]> {
  return fromSanity(allCouponsQuery, memoryCatalog().coupons);
}

export async function getZones(): Promise<ShippingZone[]> {
  const zones = await fromSanity(allZonesQuery, memoryCatalog().zones);
  return zones.length ? zones : memoryCatalog().zones;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  return fromSanity(allSubscribersQuery, memoryCatalog().subscribers);
}

export async function getCatalog(): Promise<Catalog> {
  const [products, testimonials, orders, coupons, zones, subscribers] =
    await Promise.all([
      getProducts(),
      getTestimonials(),
      getOrders(),
      getCoupons(),
      getZones(),
      getSubscribers(),
    ]);
  return { products, testimonials, orders, coupons, zones, subscribers };
}
