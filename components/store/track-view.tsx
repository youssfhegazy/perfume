"use client";

import { useState } from "react";

import { MoButton } from "@/components/brand/button";
import { Overline, StatusPill, type StatusTone } from "@/components/brand/primitives";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { count, formatDate, ml as mlFmt, money, orderId } from "@/lib/format";
import { lookupOrder } from "@/lib/orders";
import type { Order, OrderStatus, ShippingZone } from "@/lib/types";

const TONE: Record<OrderStatus, StatusTone> = {
  new: "info",
  packed: "warning",
  shipped: "aqua",
  delivered: "success",
  cancelled: "danger",
};

/* Guest order tracking. The phone number is the shared secret, so an order
   number on its own reveals nothing. */

export function TrackView({
  initialId,
  zones,
}: {
  initialId: string;
  zones: ShippingZone[];
}) {
  const { dict, locale } = useLocale();
  const [id, setId] = useState(initialId);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setNotFound(false);
    const found = await lookupOrder(id, phone);
    setOrder(found);
    setNotFound(!found);
    setPending(false);
  }

  const zone = order
    ? zones.find((z) => z.id === order.address.governorate)
    : null;

  const steps: Array<{ label: string; done: boolean; current: boolean }> = order
    ? (() => {
        const order4: OrderStatus[] = ["new", "packed", "shipped", "delivered"];
        const at = order4.indexOf(order.status);
        return [
          dict.confirm.next1,
          dict.confirm.next2,
          dict.confirm.next3,
          dict.confirm.next4,
        ].map((label, i) => ({
          label,
          done: at > i,
          current: at === i,
        }));
      })()
    : [];

  return (
    <div className="page-x mx-auto w-full max-w-[640px] py-12 lg:py-20">
      <Overline>{dict.brand}</Overline>
      <h1 className="display-lg mt-3">{dict.track.title}</h1>
      <p className="mt-3 text-base text-[var(--ink-muted)]">
        {dict.track.intro}
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">
            {dict.track.orderNumber}
          </span>
          <input
            dir="ltr"
            required
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="MO-24817"
            className="min-h-11 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3 text-base"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">{dict.track.phone}</span>
          <input
            dir="ltr"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+20 100 000 0000"
            className="min-h-11 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3 text-base"
          />
        </label>

        <MoButton type="submit" className="w-fit" loading={pending}>
          {dict.track.submit}
        </MoButton>
      </form>

      {notFound ? (
        <p
          role="alert"
          className="mt-6 rounded-[var(--r-sm)] bg-[var(--danger-soft)] px-4 py-3 text-[13px] text-[var(--danger)]"
        >
          {dict.track.notFound}
        </p>
      ) : null}

      {order ? (
        <section className="mt-10 border border-[var(--line)] p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="num text-[20px] font-semibold">
              {orderId(order.id, locale)}
            </h2>
            <StatusPill tone={TONE[order.status]}>
              {dict.status[order.status]}
            </StatusPill>
            <span className="ms-auto text-[13px] text-[var(--ink-muted)]">
              {dict.track.placed} {formatDate(order.placedAt, locale)}
            </span>
          </div>

          <ol className="mb-6 flex flex-col gap-4">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    background: step.done
                      ? "var(--success)"
                      : step.current
                        ? "var(--aqua)"
                        : "var(--line-strong)",
                  }}
                />
                <span
                  className={cn(
                    "text-sm",
                    step.done || step.current
                      ? "font-semibold"
                      : "text-[var(--ink-muted)]",
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ol>

          <dl className="flex flex-col gap-2 border-t border-[var(--line)] pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ink-muted)]">{dict.track.items}</dt>
              <dd className="num text-end">
                {order.items
                  .map(
                    (i) => `${mlFmt(i.ml, locale)} × ${count(i.qty, locale)}`,
                  )
                  .join(" · ")}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ink-muted)]">
                {dict.track.deliveringTo}
              </dt>
              <dd>{zone?.gov[locale] ?? order.address.governorate}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--ink-muted)]">{dict.track.total}</dt>
              <dd className="num font-semibold">
                {money(order.totals.total, locale)}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}
