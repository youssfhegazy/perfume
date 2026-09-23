"use client";

import Image from "next/image";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { count, iso } from "@/lib/format";
import type { Locale } from "@/lib/types";

/* ------------------------------- Overline -------------------------------- */

export function Overline({
  children,
  className,
  tone = "aqua",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "aqua" | "muted" | "deep";
}) {
  return (
    <p
      className={cn(
        "eyebrow",
        tone === "aqua" && "text-[var(--aqua-ink)]",
        tone === "muted" && "text-[var(--ink-muted)]",
        tone === "deep" && "text-[var(--on-deep)]/70",
        className,
      )}
    >
      {children}
    </p>
  );
}

/* -------------------------------- Badges --------------------------------- */

export function MerchBadge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "danger" | "warning" | "surface";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "micro inline-flex items-center rounded-[var(--r-sm)] px-2 py-[3px]",
        tone === "default" && "bg-[var(--aqua-soft)] text-[var(--aqua-ink)]",
        tone === "surface" && "bg-[var(--surface-raised)] text-[var(--ink)]",
        tone === "danger" && "bg-[var(--danger-soft)] text-[var(--danger)]",
        tone === "warning" && "bg-[var(--warning-soft)] text-[var(--warning)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "aqua"
  | "neutral";

const STATUS_TONE: Record<StatusTone, string> = {
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  aqua: "bg-[var(--aqua-soft)] text-[var(--aqua-ink)]",
  neutral: "bg-[var(--surface-sunken)] text-[var(--ink-muted)]",
};

/** Status is never conveyed by colour alone — always a dot plus a word. */
export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--r-full)] px-2.5 py-[3px] text-[12px] font-semibold whitespace-nowrap",
        STATUS_TONE[tone],
        className,
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full bg-current"
        aria-hidden
      />
      {children}
    </span>
  );
}

/* --------------------------------- Stars --------------------------------- */

export function Stars({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={cn(
            "shrink-0",
            i <= Math.round(value)
              ? "fill-[var(--aqua)] text-[var(--aqua)]"
              : "text-[var(--line-strong)]",
          )}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/* --------------------------------- Meter --------------------------------- */

/** Five 4px segments, aqua when filled. Longevity and sillage. */
export function SegmentMeter({
  value,
  label,
  locale,
}: {
  value: number;
  label: string;
  locale: Locale;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold">{label}</span>
        <span className="num text-[13px] text-[var(--ink-muted)]">
          {locale === "ar" ? iso(`${value}/5`) : `${value}/5`}
        </span>
      </div>
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1",
              i <= value ? "bg-[var(--aqua)]" : "bg-[var(--surface-sunken)]",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Stage --------------------------------- */

/** 4:5 editorial image well on sunken ground. */
export function Stage({
  src,
  alt,
  sizes = "(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw",
  priority = false,
  className,
  imgClassName,
  ratio = "4/5",
  children,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("stage", className)}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imgClassName)}
      />
      {children}
    </div>
  );
}

/* ------------------------------ Empty state ------------------------------ */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 border border-[var(--line)] px-8 py-16 text-center">
      <h3 className="heading-sm">{title}</h3>
      <p className="max-w-[46ch] text-sm text-[var(--ink-muted)]">{body}</p>
      {action}
    </div>
  );
}

/* --------------------------------- Misc ---------------------------------- */

export function RatingLine({
  rating,
  reviews,
  locale,
  reviewsLabel,
}: {
  rating: number;
  reviews: number;
  locale: Locale;
  reviewsLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Stars value={rating} />
      <span className="num text-[13px] text-[var(--ink-muted)]">
        {locale === "ar" ? iso(rating.toFixed(1)) : rating.toFixed(1)} ·{" "}
        {count(reviews, locale)} {reviewsLabel}
      </span>
    </div>
  );
}
