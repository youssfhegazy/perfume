"use client";

import Link from "next/link";
import { useEffect } from "react";

import { MoButton } from "@/components/brand/button";
import { Overline } from "@/components/brand/primitives";
import { useLocaleFromPath } from "@/components/brand/error-state";
import { getDictionary } from "@/lib/i18n/dictionary";

/* The dashboard's own boundary. A module that throws should not take the
   whole admin area down, and the message stays in the dashboard's register
   rather than the storefront's. */

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocaleFromPath();
  const d = getDictionary(locale);

  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--surface)] p-6">
      <div className="w-full max-w-[460px] rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface-raised)] p-8 text-center shadow-[var(--shadow-soft)]">
        <Overline className="num mb-3">{d.errors.serverCode}</Overline>
        <h1 className="heading-sm mb-2 text-[24px]">{d.errors.adminTitle}</h1>
        <p className="mb-6 text-sm text-[var(--ink-muted)]">
          {d.errors.adminBody}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <MoButton size="admin" onClick={reset}>
            {d.errors.retry}
          </MoButton>
          <Link
            href={`/${locale}/admin`}
            className="inline-flex min-h-9 items-center justify-center rounded-[var(--r-md)] border border-[var(--line-strong)] px-4 text-[13px] font-semibold"
          >
            {d.errors.adminBack}
          </Link>
        </div>

        {error.digest ? (
          <p className="num mt-5 text-[12px] text-[var(--ink-muted)]">
            {d.errors.reference}: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
