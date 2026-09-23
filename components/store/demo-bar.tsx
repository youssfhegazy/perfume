"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowRight, KeyRound, PlayCircle } from "lucide-react";

import { useLocale } from "@/components/providers/locale-provider";
import { enterDemo } from "@/lib/auth/actions";

/* Two ways into the dashboard from the storefront footer.
 *
 * The parent decides whether to render this at all; the server action checks
 * the demo flag again before it will create a session.
 */

export function DemoBar() {
  const { dict, locale, isRtl, href } = useLocale();
  const [pending, start] = useTransition();

  const Arrow = (
    <ArrowRight
      className={`size-4 shrink-0 ${isRtl ? "rotate-180" : ""}`}
      strokeWidth={2}
      aria-hidden
    />
  );

  return (
    <section
      aria-label={dict.footer.demoTitle}
      className="border-t border-white/[0.14] pt-6"
    >
      <p className="mb-3 text-[13px] font-semibold text-[var(--on-deep)]">
        {dict.footer.demoTitle}
      </p>

      <div className="flex flex-wrap gap-3">
        {/* Straight in, nothing to type. */}
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => void enterDemo(locale))}
          className="flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] bg-[var(--on-deep)] px-5 text-sm font-semibold text-[var(--deep)] transition-opacity hover:opacity-90 disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--on-deep)]"
        >
          <PlayCircle className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          {pending ? dict.footer.demoEntering : dict.footer.demoEnter}
          {Arrow}
        </button>

        {/* The real door. */}
        <Link
          href={href("/admin/login")}
          className="flex min-h-11 items-center gap-2 rounded-[var(--r-sm)] border border-[var(--on-deep)]/45 px-5 text-sm font-semibold text-[var(--on-deep)] transition-colors hover:border-[var(--on-deep)] hover:bg-[var(--on-deep)]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--on-deep)]"
        >
          <KeyRound className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          {dict.footer.realSignIn}
        </Link>
      </div>

      <p className="mt-3 max-w-[64ch] text-[11px] text-[var(--on-deep)]/60">
        {dict.footer.demoNote}
      </p>
    </section>
  );
}
