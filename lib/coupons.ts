import type { Coupon } from "./types";

/* Coupon eligibility. Shared by the checkout preview and by `placeOrder`, so
   what the shopper is shown and what the server actually charges can never
   drift apart. */

export type CouponRejection =
  | "unknown"
  | "paused"
  | "expired"
  | "not-started"
  | "used-up"
  | "min-order";

export type CouponCheck =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; reason: CouponRejection };

export function checkCoupon(
  code: string,
  subtotal: number,
  coupons: Coupon[],
  now: Date = new Date(),
): CouponCheck {
  const wanted = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === wanted);

  if (!coupon) return { ok: false, reason: "unknown" };
  if (!coupon.on) return { ok: false, reason: "paused" };

  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    return { ok: false, reason: "not-started" };
  }
  if (coupon.endsAt && now > new Date(coupon.endsAt)) {
    return { ok: false, reason: "expired" };
  }
  if (coupon.usageLimit !== null && coupon.used >= coupon.usageLimit) {
    return { ok: false, reason: "used-up" };
  }
  if (coupon.minOrder !== null && subtotal < coupon.minOrder) {
    return { ok: false, reason: "min-order" };
  }

  return {
    ok: true,
    coupon,
    discount: Math.round((subtotal * coupon.pct) / 100),
  };
}
