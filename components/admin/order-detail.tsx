"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";

import { MoButton } from "@/components/brand/button";
import { AdminCard, OrderStatusPill } from "@/components/admin/ui";
import { useLocale } from "@/components/providers/locale-provider";
import { advanceOrder } from "@/lib/actions";
import {
  displayName,
  formatDate,
  formatDateTime,
  ml as mlFmt,
  money,
  orderId,
} from "@/lib/format";
import { productImage } from "@/lib/images";
import type { Order, Product, ShippingZone } from "@/lib/types";

export function OrderDetail({
  order,
  products,
  zones,
}: {
  order: Order;
  products: Product[];
  zones: ShippingZone[];
}) {
  const { dict, locale, href } = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();

  const zone = zones.find((z) => z.id === order.address.governorate);

  const advanceLabel = {
    new: dict.admin.advanceNew,
    packed: dict.admin.advancePacked,
    shipped: dict.admin.advanceShipped,
    delivered: dict.admin.reopen,
    cancelled: dict.admin.reopen,
  }[order.status];

  function onAdvance() {
    start(async () => {
      const res = await advanceOrder(order.id);
      if (res.ok) {
        toast.success(dict.admin.statusChanged);
        router.refresh();
      } else {
        toast.error(dict.common.saveFailed);
      }
    });
  }

  const doneThrough = { new: 0, packed: 1, shipped: 2, delivered: 3, cancelled: 0 }[
    order.status
  ];

  const timeline = [
    { title: dict.admin.tl1, note: order.customer.name },
    { title: dict.admin.tl2, note: dict.admin.fulfilment },
    { title: dict.admin.tl3, note: zone?.gov[locale] ?? "" },
    { title: dict.admin.tl4, note: zone?.eta[locale] ?? "" },
  ];

  const paymentLabel =
    order.payment === "cod"
      ? dict.checkout.cod
      : order.payment === "card"
        ? dict.checkout.card
        : dict.checkout.wallet;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-6">
        <AdminCard className="print-sheet">
          {/* Letterhead — print only. */}
          <div className="print-only mb-6">
            <p className="wordmark text-[16px]">{dict.brand}</p>
            <p className="mt-1 text-[12px] text-[var(--ink-muted)]">
              {dict.admin.invoiceAddress}
            </p>
            <h1 className="heading-sm mt-4 text-[22px]">
              {dict.admin.invoiceTitle} {orderId(order.id, locale)}
            </h1>
            <div className="mt-3 text-[12px] text-[var(--ink-muted)]">
              <p>
                <strong>{dict.admin.invoiceFor}:</strong> {order.customer.name}
                {" · "}
                <span dir="ltr">{order.customer.phone}</span>
              </p>
              <p>
                {order.address.street}
                {zone ? ` · ${zone.gov[locale]}` : ""}
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3 print:hidden">
            <h2 className="num text-[20px] font-semibold">
              {orderId(order.id, locale)}
            </h2>
            <OrderStatusPill status={order.status} d={dict} />
            <span className="ms-auto text-[13px] text-[var(--ink-muted)]">
              {dict.admin.orderPlaced} {formatDate(order.placedAt, locale)}
            </span>
          </div>

          <ul className="flex flex-col divide-y divide-[var(--line)]">
            {order.items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <li
                  key={`${item.productId}-${item.ml}`}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="relative h-[55px] w-11 shrink-0 overflow-hidden bg-[var(--surface-sunken)]">
                    <Image
                      src={productImage(item.productId)}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {product ? displayName(product, locale) : item.productId}
                    </span>
                    <span className="num block text-[12px] text-[var(--ink-muted)]">
                      {mlFmt(item.ml, locale)} × {item.qty}
                    </span>
                  </span>
                  <span className="num text-sm font-semibold">
                    {money(item.unitPrice * item.qty, locale)}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-4 flex flex-col gap-2 border-t border-[var(--line)] pt-4 text-sm">
            <Row
              label={dict.admin.subtotal}
              value={money(order.totals.subtotal, locale)}
            />
            <Row
              label={dict.checkout.shipping}
              value={
                order.totals.shipping === 0
                  ? dict.checkout.free
                  : money(order.totals.shipping, locale)
              }
            />
            {order.totals.giftWrap > 0 ? (
              <Row
                label={dict.checkout.giftWrap}
                value={money(order.totals.giftWrap, locale)}
              />
            ) : null}
            {order.totals.codFee > 0 ? (
              <Row
                label={dict.checkout.codFee}
                value={money(order.totals.codFee, locale)}
              />
            ) : null}
            <div className="mt-1 flex items-baseline justify-between border-t border-[var(--line)] pt-3">
              <dt className="text-base font-bold">{dict.checkout.total}</dt>
              <dd className="num text-base font-bold">
                {money(order.totals.total, locale)}
              </dd>
            </div>
          </dl>

          <p className="print-only mt-8 text-[12px] text-[var(--ink-muted)]">
            {dict.admin.invoiceThanks}
          </p>
        </AdminCard>

        <AdminCard title={dict.admin.timeline} className="print-hide">
          <ol className="flex flex-col gap-5">
            {timeline.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="mt-1.5 size-2.5 shrink-0 rounded-full"
                  style={{
                    background:
                      i < doneThrough
                        ? "var(--success)"
                        : i === doneThrough
                          ? "var(--aqua)"
                          : "var(--line-strong)",
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {step.title}
                  </span>
                  <span className="block text-[12px] text-[var(--ink-muted)]">
                    {step.note}
                  </span>
                </span>
                <span className="num shrink-0 text-[12px] text-[var(--ink-muted)]">
                  {i <= doneThrough ? formatDateTime(order.placedAt, locale) : "—"}
                </span>
              </li>
            ))}
          </ol>
        </AdminCard>
      </div>

      <div className="print-hide flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <AdminCard title={dict.admin.fulfilment}>
          <div className="flex flex-col gap-2.5">
            <MoButton size="admin" block onClick={onAdvance} loading={pending}>
              {advanceLabel}
            </MoButton>
            <MoButton
              size="admin"
              variant="subtle"
              block
              onClick={() => window.print()}
            >
              <Printer className="size-3.5" strokeWidth={1.5} />
              {dict.admin.printInvoice}
            </MoButton>
            <Link
              href={href("/admin/orders")}
              className="text-center text-[13px] text-[var(--aqua-ink)] underline decoration-[var(--aqua)] underline-offset-4"
            >
              {dict.admin.backToOrders}
            </Link>
          </div>
        </AdminCard>

        <AdminCard title={dict.admin.customer}>
          <dl className="flex flex-col gap-3 text-sm">
            <Stack label={dict.checkout.fullName} value={order.customer.name} />
            <Stack label={dict.checkout.phone} value={order.customer.phone} ltr />
            <Stack label={dict.checkout.email} value={order.customer.email} ltr />
            <Stack
              label={dict.admin.colGovernorate}
              value={zone?.gov[locale] ?? order.address.governorate}
            />
            <Stack label={dict.checkout.street} value={order.address.street} />
            <Stack label={dict.admin.paymentMethod} value={paymentLabel} />
          </dl>
        </AdminCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--ink-muted)]">{label}</dt>
      <dd className="num font-medium">{value}</dd>
    </div>
  );
}

function Stack({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[12px] text-[var(--ink-muted)]">{label}</dt>
      <dd className="text-sm" dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}
