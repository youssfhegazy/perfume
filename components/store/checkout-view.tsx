"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import { MoButton } from "@/components/brand/button";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  computeTotals,
  displayName,
  ml as mlFmt,
  money,
  STANDARD_SHIPPING,
} from "@/lib/format";
import { productImage } from "@/lib/images";
import { checkCoupon, type CouponRejection } from "@/lib/coupons";
import { placeOrder } from "@/lib/orders";
import type {
  Coupon,
  GovernorateId,
  PaymentMethod,
  ShippingMethod,
  ShippingZone,
} from "@/lib/types";
import { validateContact, type Errors } from "@/lib/validation";

interface Contact {
  name: string;
  phone: string;
  email: string;
  governorate: GovernorateId;
  street: string;
}

export function CheckoutView({
  zones,
  coupons,
}: {
  zones: ShippingZone[];
  coupons: Coupon[];
}) {
  const { dict, locale, href } = useLocale();
  const router = useRouter();
  const { lines, resolved, subtotal, giftWrap, setGiftWrap, clear } = useCart();

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);

  const [contact, setContact] = useState<Contact>({
    name: "",
    phone: "",
    email: "",
    governorate: zones[0]?.id ?? "cairo",
    street: "",
  });
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("cod");

  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const zone = zones.find((z) => z.id === contact.governorate);
  const zoneFee = zone?.fee ?? STANDARD_SHIPPING;

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal,
        couponPct: applied?.pct ?? null,
        shippingMethod: shipping,
        zoneFee,
        giftWrap,
        cod: payment === "cod",
      }),
    [subtotal, applied, shipping, zoneFee, giftWrap, payment],
  );

  function couponMessage(reason: CouponRejection) {
    return {
      unknown: dict.checkout.couponBad,
      paused: dict.checkout.couponPaused,
      expired: dict.checkout.couponExpired,
      "not-started": dict.checkout.couponNotStarted,
      "used-up": dict.checkout.couponUsedUp,
      "min-order": dict.checkout.couponMinOrder,
    }[reason];
  }

  function applyCoupon() {
    // Same rules the server will re-run, so the preview cannot mislead.
    const check = checkCoupon(couponInput, subtotal, coupons);
    if (check.ok) {
      setApplied(check.coupon);
      setCouponMsg({ ok: true, text: dict.checkout.couponOk });
    } else {
      setApplied(null);
      setCouponMsg({ ok: false, text: couponMessage(check.reason) });
    }
  }

  function submitStep1() {
    const e = validateContact(contact, dict);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(2);
  }

  async function submitOrder() {
    setPlacing(true);
    setFailure(null);

    const res = await placeOrder({
      lines: lines.map((l) => ({ ...l })),
      customer: {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
      },
      address: { governorate: contact.governorate, street: contact.street },
      shipping,
      payment,
      giftWrap,
      couponCode: applied?.code ?? null,
      locale,
    });

    if (res.ok) {
      clear();
      router.push(`${href("/checkout/confirmation")}?id=${res.orderId}`);
      return;
    }

    setPlacing(false);
    if (res.outOfStock?.length) {
      setFailure(dict.checkout.outOfStockBody);
    } else if (res.couponRejected) {
      setApplied(null);
      setCouponMsg({ ok: false, text: couponMessage(res.couponRejected) });
      setFailure(couponMessage(res.couponRejected));
    } else if (res.errors.email || res.errors.name || res.errors.street) {
      setStep(1);
      setErrors(
        Object.fromEntries(
          Object.entries(res.errors).map(([k, v]) => [
            k,
            v === "invalid" ? dict.checkout.emailInvalid : dict.checkout.required,
          ]),
        ),
      );
    } else {
      setFailure(dict.checkout.orderFailed);
    }
  }

  if (resolved.length === 0 && !placing) {
    return (
      <div className="shell page-x flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="display-lg">{dict.bag.empty}</h1>
        <p className="text-[var(--ink-muted)]">{dict.bag.emptyBody}</p>
        <MoButton onClick={() => router.push(href("/collection"))}>
          {dict.bag.emptyCta}
        </MoButton>
      </div>
    );
  }

  const steps = [dict.checkout.step1, dict.checkout.step2, dict.checkout.step3];

  return (
    <div className="shell page-x py-10 lg:py-16">
      <h1 className="display-lg mb-8">{dict.checkout.title}</h1>

      {/* Step indicator */}
      <ol className="hairline mb-10 flex flex-wrap items-center gap-6 pb-6 pt-0">
        {steps.map((label, i) => {
          const n = i + 1;
          const reached = step >= n;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  "num grid size-6 place-items-center rounded-full text-[12px] font-semibold",
                  reached
                    ? "bg-[var(--primary-c)] text-[var(--on-primary)]"
                    : "border border-[var(--line-strong)] text-[var(--ink-muted)]",
                )}
              >
                {step > n ? <Check className="size-3.5" strokeWidth={2.5} /> : n}
              </span>
              <span
                className={cn(
                  "text-[13px]",
                  reached ? "font-semibold" : "text-[var(--ink-muted)]",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <div className="min-w-0">
          {step === 1 ? (
            <section className="flex flex-col gap-5">
              <h2 className="heading-sm">{dict.checkout.step1}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={dict.checkout.fullName}
                  value={contact.name}
                  error={errors.name}
                  onChange={(v) => setContact((c) => ({ ...c, name: v }))}
                />
                <Field
                  label={dict.checkout.phone}
                  value={contact.phone}
                  error={errors.phone}
                  ltr
                  type="tel"
                  onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
                />
                <Field
                  label={dict.checkout.email}
                  value={contact.email}
                  error={errors.email}
                  ltr
                  type="email"
                  onChange={(v) => setContact((c) => ({ ...c, email: v }))}
                />
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold">
                    {dict.checkout.governorate}
                  </span>
                  <select
                    value={contact.governorate}
                    onChange={(e) =>
                      setContact((c) => ({
                        ...c,
                        governorate: e.target.value as GovernorateId,
                      }))
                    }
                    className="min-h-11 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3 text-base"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.gov[locale]}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <Field
                    label={dict.checkout.street}
                    value={contact.street}
                    error={errors.street}
                    onChange={(v) => setContact((c) => ({ ...c, street: v }))}
                  />
                </div>
              </div>
              <MoButton className="w-fit" onClick={submitStep1}>
                {dict.checkout.continueShipping}
              </MoButton>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="flex flex-col gap-5">
              <h2 className="heading-sm">{dict.checkout.step2}</h2>
              <div className="flex flex-col gap-3">
                <RadioCard
                  checked={shipping === "standard"}
                  onChange={() => setShipping("standard")}
                  title={dict.checkout.standard}
                  note={dict.checkout.standardNote}
                  price={
                    subtotal >= 2000
                      ? dict.checkout.free
                      : money(zoneFee, locale)
                  }
                />
                <RadioCard
                  checked={shipping === "express"}
                  onChange={() => setShipping("express")}
                  title={dict.checkout.express}
                  note={dict.checkout.expressNote}
                  price={money(120, locale)}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 bg-[var(--pearl)] px-4 py-3 text-sm text-[#10262b]">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="size-4 accent-[var(--primary-c)]"
                />
                <span className="flex-1">{dict.bag.giftWrap}</span>
                <span className="num font-semibold">{dict.bag.giftWrapPrice}</span>
              </label>

              <div className="flex flex-wrap gap-3">
                <MoButton variant="outline" onClick={() => setStep(1)}>
                  {dict.checkout.back}
                </MoButton>
                <MoButton onClick={() => setStep(3)}>
                  {dict.checkout.continuePayment}
                </MoButton>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="flex flex-col gap-5">
              <h2 className="heading-sm">{dict.checkout.step3}</h2>
              <div className="flex flex-col gap-3">
                <RadioCard
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  title={dict.checkout.cod}
                  note={dict.checkout.codNote}
                />
                <RadioCard
                  checked={payment === "card"}
                  onChange={() => setPayment("card")}
                  title={dict.checkout.card}
                  note={dict.checkout.cardNote}
                />
                <RadioCard
                  checked={payment === "wallet"}
                  onChange={() => setPayment("wallet")}
                  title={dict.checkout.wallet}
                  note={dict.checkout.walletNote}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <MoButton variant="outline" onClick={() => setStep(2)}>
                  {dict.checkout.back}
                </MoButton>
                <MoButton
                  onClick={submitOrder}
                  loading={placing}
                  loadingLabel={dict.checkout.placing}
                >
                  {dict.checkout.placeOrder}
                </MoButton>
              </div>

              {failure ? (
                <p
                  role="alert"
                  className="rounded-[var(--r-sm)] bg-[var(--danger-soft)] px-4 py-3 text-[13px] text-[var(--danger)]"
                >
                  {failure}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        {/* Summary */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-4 border border-[var(--line)] bg-[var(--surface-raised)] p-5">
            <h2 className="text-base font-semibold">{dict.checkout.summary}</h2>

            <ul className="flex flex-col gap-3">
              {resolved.map((line) => (
                <li
                  key={`${line.productId}-${line.ml}`}
                  className="flex items-center gap-3"
                >
                  <span className="relative h-[60px] w-12 shrink-0 overflow-hidden bg-[var(--surface-sunken)]">
                    <Image
                      src={productImage(line.product)}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {displayName(line.product, locale)}
                    </span>
                    <span className="num block text-[13px] text-[var(--ink-muted)]">
                      {mlFmt(line.ml, locale)} × {line.qty}
                    </span>
                  </span>
                  <span className="num text-sm font-semibold">
                    {money(line.lineTotal, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="hairline flex flex-col gap-2 pt-4">
              <label className="text-[13px] font-semibold" htmlFor="coupon">
                {dict.checkout.coupon}
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  dir="ltr"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={dict.checkout.couponPlaceholder}
                  className="min-h-11 min-w-0 flex-1 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3 text-base uppercase"
                />
                <MoButton variant="outline" onClick={applyCoupon}>
                  {dict.checkout.apply}
                </MoButton>
              </div>
              {couponMsg ? (
                <p
                  role="status"
                  className={cn(
                    "text-[13px]",
                    couponMsg.ok
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]",
                  )}
                >
                  {couponMsg.text}
                </p>
              ) : null}
            </div>

            <dl className="hairline flex flex-col gap-2 pt-4 text-sm">
              <Row label={dict.bag.subtotal} value={money(totals.subtotal, locale)} />
              {totals.discount > 0 ? (
                <Row
                  label={dict.checkout.discount}
                  value={`−${money(totals.discount, locale)}`}
                  tone="success"
                />
              ) : null}
              <Row
                label={dict.checkout.shipping}
                value={
                  totals.shipping === 0
                    ? dict.checkout.free
                    : money(totals.shipping, locale)
                }
              />
              {totals.giftWrap > 0 ? (
                <Row
                  label={dict.checkout.giftWrap}
                  value={money(totals.giftWrap, locale)}
                />
              ) : null}
              {totals.codFee > 0 ? (
                <Row
                  label={dict.checkout.codFee}
                  value={money(totals.codFee, locale)}
                />
              ) : null}
              <div className="hairline mt-2 flex items-baseline justify-between pt-3">
                <dt className="text-[18px] font-bold">{dict.checkout.total}</dt>
                <dd className="num text-[18px] font-bold">
                  {money(totals.total, locale)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--ink-muted)]">{label}</dt>
      <dd
        className={cn(
          "num font-medium",
          tone === "success" && "text-[var(--success)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  ltr = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  ltr?: boolean;
  type?: string;
}) {
  const id = `f-${label.replace(/\s+/g, "-")}`;
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      <span className="text-[13px] font-semibold">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        dir={ltr ? "ltr" : undefined}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          "min-h-11 rounded-[var(--r-sm)] border px-3 text-base",
          error
            ? "border-[var(--danger)] bg-[var(--danger-soft)]"
            : "border-[var(--line-strong)] bg-[var(--surface-raised)]",
          ltr && "text-start",
        )}
      />
      {error ? (
        <span id={`${id}-err`} className="text-[12px] text-[var(--danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function RadioCard({
  checked,
  onChange,
  title,
  note,
  price,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  note: string;
  price?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-[var(--r-sm)] border p-4",
        checked
          ? "border-[var(--primary-c)] bg-[var(--aqua-soft)]"
          : "border-[var(--line-strong)]",
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 shrink-0 accent-[var(--primary-c)]"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-[13px] text-[var(--ink-muted)]">{note}</span>
      </span>
      {price ? <span className="num text-sm font-semibold">{price}</span> : null}
    </label>
  );
}
