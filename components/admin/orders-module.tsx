"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AdminCard,
  FilterPill,
  OrderStatusPill,
  TableShell,
  Td,
  Th,
} from "@/components/admin/ui";
import { useLocale } from "@/components/providers/locale-provider";
import { count, formatDate, money, orderId } from "@/lib/format";
import type { Order, OrderStatus, ShippingZone } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "new",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrdersModule({
  orders,
  zones,
}: {
  orders: Order[];
  zones: ShippingZone[];
}) {
  const { dict, locale, href } = useLocale();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const rows = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  const govName = (id: string) =>
    zones.find((z) => z.id === id)?.gov[locale] ?? id;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          {dict.admin.all}
        </FilterPill>
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
          >
            {dict.status[s]}
          </FilterPill>
        ))}
        <p className="num ms-auto text-[13px] text-[var(--ink-muted)]">
          {count(rows.length, locale)}
        </p>
      </div>

      <AdminCard className="hidden md:flex">
        <TableShell minWidth={760}>
          <thead>
            <tr>
              <Th>{dict.admin.colOrder}</Th>
              <Th>{dict.admin.colCustomer}</Th>
              <Th>{dict.admin.colGovernorate}</Th>
              <Th>{dict.admin.colDate}</Th>
              <Th>{dict.admin.colStatus}</Th>
              <Th align="end">{dict.admin.colTotal}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
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
                <Td>{govName(o.address.governorate)}</Td>
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

      {/* Mobile card list */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((o) => (
          <li key={o.id}>
            <Link
              href={href(`/admin/orders/${o.id}`)}
              className="flex flex-col gap-2 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="num text-sm font-semibold">
                  {orderId(o.id, locale)}
                </span>
                <OrderStatusPill status={o.status} d={dict} />
              </div>
              <p className="text-sm">{o.customer.name}</p>
              <div className="flex flex-wrap justify-between gap-x-4 text-[12px] text-[var(--ink-muted)]">
                <span>{govName(o.address.governorate)}</span>
                <span>{formatDate(o.placedAt, locale)}</span>
                <span className="num font-semibold text-[var(--ink)]">
                  {money(o.totals.total, locale)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
