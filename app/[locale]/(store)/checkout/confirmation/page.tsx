import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MoLink } from "@/components/brand/button";
import { Overline } from "@/components/brand/primitives";
import { getOrders, getZones } from "@/lib/data";
import { formatDate, money, orderId } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout/confirmation">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getDictionary(locale).confirm.overline,
    robots: { index: false },
  };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: PageProps<"/[locale]/checkout/confirmation">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const id = typeof sp.id === "string" ? sp.id : "";
  const d = getDictionary(locale);

  // Read the order that was actually created rather than trusting the URL.
  const [orders, zones] = await Promise.all([getOrders(), getZones()]);
  const order = orders.find((o) => o.id === id);
  if (!order) notFound();

  const zone = zones.find((z) => z.id === order.address.governorate);

  const paymentLabel =
    order.payment === "cod"
      ? d.checkout.cod
      : order.payment === "card"
        ? d.checkout.card
        : d.checkout.wallet;

  const arriving = new Date(order.placedAt);
  arriving.setDate(arriving.getDate() + (order.shipping === "express" ? 1 : 3));

  const facts = [
    { label: d.confirm.orderNumber, value: orderId(order.id, locale) },
    { label: d.confirm.payment, value: paymentLabel },
    { label: d.confirm.deliveringTo, value: zone?.gov[locale] ?? "" },
    { label: d.confirm.arriving, value: formatDate(arriving.toISOString(), locale) },
  ];

  const timeline = [
    { title: d.confirm.next1, note: d.confirm.next1Note, state: "done" },
    { title: d.confirm.next2, note: d.confirm.next2Note, state: "current" },
    { title: d.confirm.next3, note: d.confirm.next3Note, state: "future" },
    { title: d.confirm.next4, note: d.confirm.next4Note, state: "future" },
  ] as const;

  return (
    <div className="page-x mx-auto w-full max-w-[720px] py-16 lg:py-24">
      <Overline className="text-[var(--success)]">{d.confirm.overline}</Overline>
      <h1 className="display-lg mt-4">{d.confirm.title}</h1>
      <p className="mt-4 text-base leading-[26px] text-[var(--ink-muted)]">
        {d.confirm.body}
      </p>

      <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="hairline flex flex-col gap-1 pt-4">
            <dt className="text-[13px] text-[var(--ink-muted)]">{f.label}</dt>
            <dd className="num text-sm font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* The real total, straight from the created order. */}
      <div className="hairline mt-6 flex items-baseline justify-between pt-4">
        <span className="text-base font-semibold">{d.checkout.total}</span>
        <span className="num text-[18px] font-bold">
          {money(order.totals.total, locale)}
        </span>
      </div>

      <section className="mt-12 border border-[var(--line)] p-6 lg:p-8">
        <h2 className="heading-sm mb-6">{d.confirm.nextTitle}</h2>
        <ol className="flex flex-col gap-5">
          {timeline.map((step) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{
                  background:
                    step.state === "done"
                      ? "var(--success)"
                      : step.state === "current"
                        ? "var(--aqua)"
                        : "var(--line-strong)",
                }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{step.title}</span>
                <span className="block text-[13px] text-[var(--ink-muted)]">
                  {step.note}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <MoLink href={`/${locale}/collection`}>{d.confirm.continue}</MoLink>
        <MoLink
          href={`/${locale}/track?id=${encodeURIComponent(order.id)}`}
          variant="outline"
        >
          {d.confirm.track}
        </MoLink>
      </div>
    </div>
  );
}
