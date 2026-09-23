import type { Dictionary } from "./i18n/dictionary";

/* Every validation rule in one place — DATA_CONTRACTS.md.
   Behaviour: validation is deferred until first submit or first edit of a
   field. A pristine form shows no errors. On submit with errors, every
   offending field gets the error treatment and nothing is written. */

export const EMAIL_RE = /.+@.+\..+/;
export const COUPON_RE = /^[A-Z0-9]{4,16}$/;
export const DESC_MAX = 320;
export const TESTIMONIAL_MIN = 10;

export type Errors = Record<string, string>;

export function isEmail(v: string) {
  return EMAIL_RE.test(v.trim());
}

export function isCouponCode(v: string) {
  return COUPON_RE.test(v.trim());
}

export function isPositivePrice(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

export function isStock(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && Number.isInteger(n);
}

export function isFee(v: unknown) {
  if (v === "" || v === null || v === undefined) return false;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0;
}

export function isPercent(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 90;
}

/** Checkout step 1. */
export function validateContact(
  values: { name: string; phone: string; email: string; street: string },
  d: Dictionary,
): Errors {
  const e: Errors = {};
  if (!values.name.trim()) e.name = d.checkout.required;
  if (!values.phone.trim()) e.phone = d.checkout.required;
  if (!values.email.trim()) e.email = d.checkout.required;
  else if (!isEmail(values.email)) e.email = d.checkout.emailInvalid;
  if (!values.street.trim()) e.street = d.checkout.required;
  return e;
}
