"use client";

import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/* Brand button. shadcn's Button is re-themed for the dashboard elsewhere; this
   is the storefront/admin action per the Components section of DESIGN.md:
   44px and radius-sm on the storefront, 36px and radius-md in the dashboard.
   Height is a min-height with padding, never a fixed height — Arabic labels
   wrap and were being clipped. */

const moButton = cva(
  [
    "inline-flex items-center justify-center gap-2 text-center",
    "font-sans text-sm font-semibold leading-tight",
    "border transition-[background-color,color,border-color] duration-[180ms]",
    "cursor-pointer select-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary-c)] border-[var(--primary-c)] text-[var(--on-primary)] hover:bg-[var(--aqua-ink)] hover:border-[var(--aqua-ink)]",
        outline:
          "bg-transparent border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]",
        onDeep:
          "bg-transparent border-[var(--on-deep)] text-[var(--on-deep)] hover:bg-[var(--on-deep)] hover:text-[var(--deep)]",
        ghost:
          "bg-transparent border-transparent text-[var(--ink)] underline decoration-[var(--aqua)] underline-offset-4 hover:text-[var(--aqua-ink)]",
        subtle:
          "bg-[var(--surface-raised)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--line-strong)]",
        danger:
          "bg-[var(--danger)] border-[var(--danger)] text-[var(--surface-raised)] hover:opacity-90",
        dangerSoft:
          "bg-[var(--danger-soft)] border-[var(--danger-soft)] text-[var(--danger)] hover:border-[var(--danger)]",
      },
      size: {
        /** Storefront: 44px, radius-sm, space-6 padding. */
        store: "min-h-11 rounded-[var(--r-sm)] px-6 py-2",
        /** Dashboard: 36px, radius-md. */
        admin: "min-h-9 rounded-[var(--r-md)] px-4 py-1.5 text-[13px]",
        /** Icon-only, still 44px for touch. */
        icon: "min-h-11 w-11 rounded-[var(--r-sm)] p-0",
        iconAdmin: "min-h-9 w-9 rounded-[var(--r-md)] p-0",
        chip: "min-h-8 rounded-[var(--r-full)] px-3 text-[13px]",
        link: "min-h-0 rounded-none px-0 py-0",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "store", block: false },
  },
);

export interface MoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof moButton> {
  loading?: boolean;
  loadingLabel?: string;
}

export const MoButton = React.forwardRef<HTMLButtonElement, MoButtonProps>(
  function MoButton(
    {
      className,
      variant,
      size,
      block,
      loading = false,
      loadingLabel,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(moButton({ variant, size, block }), className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {loadingLabel ?? children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

/** Same visual treatment, rendered as a link. */
export function MoLink({
  className,
  variant,
  size,
  block,
  ...props
}: React.ComponentProps<typeof Link> & VariantProps<typeof moButton>) {
  return (
    <Link
      className={cn(moButton({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { moButton };
