"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { StatusPill, type StatusTone } from "@/components/brand/primitives";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { OrderStatus, ProductStatus, TestimonialStatus } from "@/lib/types";

/* --------------------------------- Card ---------------------------------- */

export function AdminCard({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface-raised)] shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {title || action ? (
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-3">
          {title ? <h2 className="text-sm font-semibold">{title}</h2> : <span />}
          {action}
        </header>
      ) : null}
      <div className={cn("min-w-0 px-6 pt-2 pb-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* -------------------------------- StatCard ------------------------------- */

export function StatCard({
  label,
  value,
  delta,
  period,
}: {
  label: string;
  value: string;
  delta: string;
  period: string;
}) {
  const up = !delta.startsWith("−") && !delta.startsWith("-");
  const Icon = up ? ArrowUp : ArrowDown;
  // A falling return rate is good news, so tone follows the label's intent.
  const good = up;

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-raised)] p-6">
      <p className="eyebrow text-[var(--ink-muted)]">{label}</p>
      <p className="num text-[28px] leading-tight font-semibold lg:text-[34px]">
        {value}
      </p>
      <p className="flex flex-wrap items-center gap-1.5 text-[13px]">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-semibold",
            good ? "text-[var(--success)]" : "text-[var(--danger)]",
          )}
        >
          <Icon className="size-3.5" strokeWidth={2} />
          <span className="num">{delta}</span>
        </span>
        <span className="text-[var(--ink-muted)]">{period}</span>
      </p>
    </div>
  );
}

/* ------------------------------ Status pills ----------------------------- */

const ORDER_TONE: Record<OrderStatus, StatusTone> = {
  new: "info",
  packed: "warning",
  shipped: "aqua",
  delivered: "success",
  cancelled: "danger",
};

export function OrderStatusPill({
  status,
  d,
}: {
  status: OrderStatus;
  d: Dictionary;
}) {
  return <StatusPill tone={ORDER_TONE[status]}>{d.status[status]}</StatusPill>;
}

const PRODUCT_TONE: Record<ProductStatus, StatusTone> = {
  live: "success",
  draft: "neutral",
  archived: "neutral",
};

export function ProductStatusPill({
  status,
  d,
}: {
  status: ProductStatus;
  d: Dictionary;
}) {
  return <StatusPill tone={PRODUCT_TONE[status]}>{d.status[status]}</StatusPill>;
}

const REVIEW_TONE: Record<TestimonialStatus, StatusTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export function ReviewStatusPill({
  status,
  d,
}: {
  status: TestimonialStatus;
  d: Dictionary;
}) {
  return <StatusPill tone={REVIEW_TONE[status]}>{d.status[status]}</StatusPill>;
}

/* -------------------------------- Table ---------------------------------- */

export function TableShell({
  minWidth,
  children,
}: {
  minWidth: number;
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "start",
  onSort,
  sorted,
  dir,
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  onSort?: () => void;
  sorted?: boolean;
  dir?: "asc" | "desc";
  className?: string;
}) {
  const content = onSort ? (
    <button
      type="button"
      onClick={onSort}
      className="inline-flex items-center gap-1"
    >
      {children}
      {sorted ? (
        dir === "asc" ? (
          <ArrowUp className="size-3 text-[var(--aqua-ink)]" strokeWidth={2} />
        ) : (
          <ArrowDown className="size-3 text-[var(--aqua-ink)]" strokeWidth={2} />
        )
      ) : null}
    </button>
  ) : (
    children
  );

  return (
    <th
      scope="col"
      className={cn(
        "micro bg-[var(--surface-sunken)] px-3 py-2.5 text-[var(--ink-muted)] whitespace-nowrap",
        align === "end" ? "text-end" : "text-start",
        className,
      )}
    >
      {content}
    </th>
  );
}

export function Td({
  children,
  align = "start",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "border-t border-[var(--line)] px-3 py-3 align-middle",
        align === "end" ? "num text-end" : "text-start",
        className,
      )}
    >
      {children}
    </td>
  );
}

/* --------------------------------- Field --------------------------------- */

export function AdminField({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[13px] font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="text-[12px] text-[var(--danger)]">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-[var(--ink-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}

export const adminInput = (invalid?: boolean) =>
  cn(
    "min-h-10 w-full rounded-[var(--r-md)] border px-3 text-sm",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]",
    invalid
      ? "border-[var(--danger)] bg-[var(--danger-soft)]"
      : "border-[var(--line-strong)] bg-[var(--surface-raised)]",
  );

/* ------------------------------ Filter pills ----------------------------- */

export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-8 rounded-[var(--r-full)] border px-3 text-[13px] whitespace-nowrap",
        active
          ? "border-[var(--primary-c)] bg-[var(--aqua-soft)] text-[var(--aqua-ink)]"
          : "border-[var(--line-strong)] text-[var(--ink-muted)]",
      )}
    >
      {children}
    </button>
  );
}
