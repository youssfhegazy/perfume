"use server";

import { revalidatePath } from "next/cache";

import { writeClient } from "@/sanity/lib/client";
import { sanityWritable } from "@/sanity/lib/env";

import { checkCoupon, type CouponRejection } from "./coupons";
import { getCoupons, getOrders, getProducts, getZones } from "./data";
import { computeTotals, STANDARD_SHIPPING, variantOf } from "./format";
import { notifyOrderPlaced } from "./notifications";
import { memoryCatalog, setMemoryCatalog } from "./store/memory";
import type {
  CartLine,
  GovernorateId,
  Locale,
  Order,
  OrderItem,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
} from "./types";
import { isEmail } from "./validation";

/* Order placement.

   Everything that decides what the customer pays is recomputed here from the
   catalogue: line prices, the delivery fee, the discount. The browser only
   says *what* it wants, never *what it costs* — otherwise a crafted request
   could set its own prices.

   Stock is checked and decremented in the same write as the order, and the
   coupon's redemption count goes up with it. */

export interface PlaceOrderInput {
  lines: CartLine[];
  customer: { name: string; phone: string; email: string };
  address: { governorate: GovernorateId; street: string };
  shipping: ShippingMethod;
  payment: PaymentMethod;
  giftWrap: boolean;
  couponCode: string | null;
  locale: Locale;
}

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | {
      ok: false;
      errors: Record<string, string>;
      /** Set when a line went out of stock between the bag and checkout. */
      outOfStock?: Array<{ productId: string; ml: number; available: number }>;
      couponRejected?: CouponRejection;
    };

function orderNumber(existing: string[]) {
  const highest = existing
    .map((id) => Number(id.replace(/\D/g, "")))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 24817);
  return `MO-${highest + 1}`;
}

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const errors: Record<string, string> = {};

  if (!input.customer.name.trim()) errors.name = "required";
  if (!input.customer.phone.trim()) errors.phone = "required";
  if (!input.customer.email.trim()) errors.email = "required";
  else if (!isEmail(input.customer.email)) errors.email = "invalid";
  if (!input.address.street.trim()) errors.street = "required";
  if (!input.lines.length) errors.lines = "empty";
  if (Object.keys(errors).length) return { ok: false, errors };

  const [products, zones, coupons, orders] = await Promise.all([
    getProducts(),
    getZones(),
    getCoupons(),
    getOrders(),
  ]);

  /* Re-price every line, and refuse anything that is not live. */
  const items: OrderItem[] = [];
  const outOfStock: Array<{
    productId: string;
    ml: number;
    available: number;
  }> = [];

  for (const line of input.lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || product.status !== "live") {
      return { ok: false, errors: { lines: "unavailable" } };
    }
    const variant = variantOf(product, line.ml);
    if (!variant) return { ok: false, errors: { lines: "unavailable" } };

    const qty = Math.max(1, Math.floor(line.qty));
    if (variant.stock < qty) {
      outOfStock.push({
        productId: product.id,
        ml: line.ml,
        available: variant.stock,
      });
      continue;
    }
    items.push({
      productId: product.id,
      ml: line.ml,
      qty,
      unitPrice: variant.p,
    });
  }

  if (outOfStock.length) {
    return { ok: false, errors: { lines: "out-of-stock" }, outOfStock };
  }

  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.qty, 0);

  /* Coupon, re-validated against the same rules the UI previewed. */
  let couponPct: number | null = null;
  let couponId: string | null = null;
  let couponCode: string | null = null;
  if (input.couponCode?.trim()) {
    const check = checkCoupon(input.couponCode, subtotal, coupons);
    if (!check.ok) {
      return {
        ok: false,
        errors: { coupon: check.reason },
        couponRejected: check.reason,
      };
    }
    couponPct = check.coupon.pct;
    couponId = check.coupon.id;
    couponCode = check.coupon.code;
  }

  const zone = zones.find((z) => z.id === input.address.governorate);
  if (!zone) return { ok: false, errors: { governorate: "unknown" } };

  // Cash on delivery is only offered where the zone supports it.
  const payment: PaymentMethod =
    input.payment === "cod" && !zone.cod ? "card" : input.payment;

  const totals = computeTotals({
    subtotal,
    couponPct,
    shippingMethod: input.shipping,
    zoneFee: zone.fee ?? STANDARD_SHIPPING,
    giftWrap: input.giftWrap,
    cod: payment === "cod",
  });

  /* Cash is owed on delivery; card and wallet wait for the gateway. Neither is
     ever "paid" here — only a verified webhook may say that. */
  const paymentStatus: PaymentStatus = payment === "cod" ? "due" : "pending";

  const order: Order = {
    id: orderNumber(orders.map((o) => o.id)),
    status: "new",
    placedAt: new Date().toISOString(),
    customer: {
      name: input.customer.name.trim(),
      phone: input.customer.phone.trim(),
      email: input.customer.email.trim().toLowerCase(),
    },
    address: {
      governorate: input.address.governorate,
      street: input.address.street.trim(),
    },
    items,
    shipping: input.shipping,
    payment,
    paymentStatus,
    giftWrap: input.giftWrap,
    coupon: couponCode,
    totals,
  };

  const client = sanityWritable ? writeClient() : null;

  if (client) {
    let tx = client.transaction();

    tx = tx.create({
      _type: "order",
      number: order.id,
      status: order.status,
      placedAt: order.placedAt,
      customer: order.customer,
      address: order.address,
      items: order.items.map((i) => ({ _type: "orderItem", ...i })),
      shipping: order.shipping,
      payment: order.payment,
      paymentStatus: order.paymentStatus,
      giftWrap: order.giftWrap,
      coupon: order.coupon ?? undefined,
      totals: { _type: "orderTotals", ...order.totals },
    });

    // Decrement the sold variants. `dec` is applied server-side by Sanity, so
    // two orders landing together cannot both read the same starting value.
    for (const item of order.items) {
      tx = tx.patch(`product.${item.productId}`, (p) =>
        p.dec({ [`variants[ml==${item.ml}].stock`]: item.qty }),
      );
    }

    if (couponId) tx = tx.patch(couponId, (p) => p.inc({ used: 1 }));

    await tx.commit();
  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      orders: [order, ...cat.orders],
      products: cat.products.map((p) => {
        const sold = order.items.filter((i) => i.productId === p.id);
        if (!sold.length) return p;
        return {
          ...p,
          variants: p.variants.map((v) => {
            const hit = sold.find((i) => i.ml === v.ml);
            return hit ? { ...v, stock: Math.max(0, v.stock - hit.qty) } : v;
          }),
        };
      }),
      coupons: cat.coupons.map((c) =>
        c.id === couponId ? { ...c, used: c.used + 1 } : c,
      ),
    });
  }

  await notifyOrderPlaced(order, input.locale);

  revalidatePath("/", "layout");
  return { ok: true, orderId: order.id };
}

/**
 * Guest order lookup for the tracking page. The phone number acts as the
 * shared secret, so an order number alone reveals nothing.
 */
export async function lookupOrder(
  orderId: string,
  phone: string,
): Promise<Order | null> {
  const wanted = orderId.trim().toUpperCase();
  const digits = phone.replace(/\D/g, "");
  if (!wanted || digits.length < 6) return null;

  const orders = await getOrders();
  const order = orders.find((o) => o.id.toUpperCase() === wanted);
  if (!order) return null;

  // Compare the last 9 digits so formatting and country code do not matter.
  const stored = order.customer.phone.replace(/\D/g, "");
  const tail = (s: string) => s.slice(-9);
  return tail(stored) === tail(digits) ? order : null;
}
