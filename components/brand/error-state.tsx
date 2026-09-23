"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MoButton } from "@/components/brand/button";
import { Overline } from "@/components/brand/primitives";
import { getDictionary, isLocale, DEFAULT_LOCALE } from "@/lib/i18n/dictionary";

/* Shared 404 / 500 panel.

   `not-found.tsx` does not receive route params, so the locale is read from
   the pathname instead. That also means this renders correctly whether Next
   reached it from a localised route or from the root. */

export function useLocaleFromPath() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] ?? "";
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function ErrorState({
  code,
  title,
  body,
  actions,
  reference,
}: {
  code: string;
  title: string;
  body: string;
  actions: React.ReactNode;
  reference?: string;
}) {
  return (
    <div className="page-x mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-5 py-24 text-center">
      <Overline className="num">{code}</Overline>
      <h1 className="display-lg">{title}</h1>
      <p className="text-base leading-relaxed text-[var(--ink-muted)]">{body}</p>
      <div className="flex flex-wrap justify-center gap-3">{actions}</div>
      {reference ? (
        <p className="num text-[12px] text-[var(--ink-muted)]">{reference}</p>
      ) : null}
    </div>
  );
}

/** The storefront 404. */
export function NotFoundState() {
  const locale = useLocaleFromPath();
  const d = getDictionary(locale);

  return (
    <ErrorState
      code={d.errors.notFoundCode}
      title={d.errors.notFoundTitle}
      body={d.errors.notFoundBody}
      actions={
        <>
          <Link
            href={`/${locale}/collection`}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-sm)] bg-[var(--primary-c)] px-6 text-sm font-semibold text-[var(--on-primary)] transition-colors hover:bg-[var(--aqua-ink)]"
          >
            {d.errors.notFoundCta}
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-sm)] border border-[var(--ink)] px-6 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-[var(--surface)]"
          >
            {d.errors.home}
          </Link>
        </>
      }
    />
  );
}

/** The storefront 500, wired to the route segment's `reset`. */
export function ServerErrorState({
  reset,
  digest,
}: {
  reset: () => void;
  digest?: string;
}) {
  const locale = useLocaleFromPath();
  const d = getDictionary(locale);

  return (
    <ErrorState
      code={d.errors.serverCode}
      title={d.errors.serverTitle}
      body={d.errors.serverBody}
      reference={digest ? `${d.errors.reference}: ${digest}` : undefined}
      actions={
        <>
          <MoButton onClick={reset}>{d.errors.retry}</MoButton>
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-sm)] border border-[var(--ink)] px-6 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-[var(--surface)]"
          >
            {d.errors.home}
          </Link>
        </>
      }
    />
  );
}
