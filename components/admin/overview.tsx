"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  AdminCard,
  FilterPill,
  OrderStatusPill,
  StatCard,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  amount,
  count,
  displayName,
  formatDate,
  money,
  orderId,
  totalStock,
} from "@/lib/format";
import { t } from "@/lib/i18n/dictionary";
import { dur, ease } from "@/lib/motion";
import type { Order, Product } from "@/lib/types";

const RANGES = { "3M": 3, "6M": 6, "12M": 12 } as const;
type Range = keyof typeof RANGES;

/* Twelve months of revenue, in thousands of EGP. Replace with the real series
   when analytics lands. */
const SERIES = [96, 104, 88, 112, 121, 118, 130, 126, 139, 133, 141, 147];

const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_AR = ["ينا","فبر","مار","أبر","مايو","يون","يول","أغس","سبت","أكت","نوف","ديس"];

export function Overview({
  products,
  orders,
}: {
  products: Product[];
  orders: Order[];
}) {
  const { dict, locale, href } = useLocale();
  const [range, setRange] = useState<Range>("12M");
  const reduced = useReducedMotion();

  const kpis = [
    {
      label: dict.admin.kpiRevenue,
      value: money(147000, locale),
      delta: "+14.8%",
    },
    { label: dict.admin.kpiOrders, value: amount(316, locale), delta: "+9.1%" },
    { label: dict.admin.kpiAov, value: money(2465, locale), delta: "+3.4%" },
    {
      label: dict.admin.kpiReturns,
      value: locale === "ar" ? amount(2.1, locale) + "٪" : "2.1%",
      delta: "−0.4pp",
    },
  ];

  const lowStock = useMemo(
    () =>
      products
        .filter((p) => p.status === "live" && totalStock(p) <= 25)
        .sort((a, b) => totalStock(a) - totalStock(b)),
    [products],
  );

  const latest = orders.slice(0, 5);

  const months = RANGES[range];
  const data = SERIES.slice(-months);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.base, ease: ease.scent, delay: i * 0.04 }}
            className="min-w-0"
          >
            <StatCard
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              period={dict.admin.vsLastMonth}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.9fr_1fr]">
        <AdminCard
          title={dict.admin.revenueTitle}
          action={
            <div className="flex gap-1.5">
              {(Object.keys(RANGES) as Range[]).map((r) => (
                <FilterPill
                  key={r}
                  active={range === r}
                  onClick={() => setRange(r)}
                >
                  {r}
                </FilterPill>
              ))}
            </div>
          }
        >
          <RevenueChart data={data} months={months} locale={locale} />
        </AdminCard>

        <AdminCard
          title={dict.admin.lowStock}
          action={
            <Link
              href={href("/admin/products")}
              className="text-[13px] text-[var(--aqua-ink)] underline decoration-[var(--aqua)] underline-offset-4"
            >
              {dict.admin.manageStock}
            </Link>
          }
        >
          {lowStock.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">
              {dict.admin.lowStockEmpty}
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {lowStock.map((p) => {
                const n = totalStock(p);
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {displayName(p, locale)}
                    </span>
                    <span
                      className={cn(
                        "num shrink-0 rounded-[var(--r-full)] px-2.5 py-0.5 text-[12px] font-semibold",
                        n <= 5
                          ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                          : "bg-[var(--warning-soft)] text-[var(--warning)]",
                      )}
                    >
                      {t(dict.admin.unitsLeft, { n: count(n, locale) })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>
      </div>

      <AdminCard title={dict.admin.latestOrders}>
        <TableShell minWidth={640}>
          <thead>
            <tr>
              <Th>{dict.admin.colOrder}</Th>
              <Th>{dict.admin.colCustomer}</Th>
              <Th>{dict.admin.colDate}</Th>
              <Th>{dict.admin.colStatus}</Th>
              <Th align="end">{dict.admin.colTotal}</Th>
            </tr>
          </thead>
          <tbody>
            {latest.map((o) => (
              <tr
                key={o.id}
                className="cursor-pointer transition-colors hover:bg-[var(--aqua-soft)]"
              >
                <Td>
                  <Link
                    href={href(`/admin/orders/${o.id}`)}
                    className="num font-semibold"
                  >
                    {orderId(o.id, locale)}
                  </Link>
                </Td>
                <Td>
                  <Link href={href(`/admin/orders/${o.id}`)}>
                    {o.customer.name}
                  </Link>
                </Td>
                <Td>{formatDate(o.placedAt, locale)}</Td>
                <Td>
                  <OrderStatusPill status={o.status} d={dict} />
                </Td>
                <Td align="end">{money(o.totals.total, locale)}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </AdminCard>
    </div>
  );
}

/** Inline SVG area chart. 640×220 viewBox, non-uniform scaling to fill. */
function RevenueChart({
  data,
  months,
  locale,
}: {
  data: number[];
  months: number;
  locale: string;
}) {
  const W = 640;
  const H = 220;
  const max = Math.max(...data) * 1.08;
  const min = Math.min(...data) * 0.85;
  const step = data.length > 1 ? W / (data.length - 1) : W;

  const points = data.map((v, i) => {
    const x = i * step;
    const y = H - ((v - min) / (max - min)) * H;
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;

  const labels = (locale === "ar" ? MONTHS_AR : MONTHS_EN).slice(-months);

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[240px] w-full"
        role="img"
        aria-label="Revenue"
      >
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="0"
            x2={W}
            y1={(H / 4) * i + 0.5}
            y2={(H / 4) * i + 0.5}
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <polygon points={area} fill="var(--aqua-soft)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--aqua-ink)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === points.length - 1 ? 4.5 : 2.5}
            fill="var(--aqua-ink)"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[12px] text-[var(--ink-muted)]">
        {labels.map((m, i) => (
          <span
            key={m + i}
            className={cn(months === 12 && i % 2 === 1 && "invisible")}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
