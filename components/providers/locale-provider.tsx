"use client";

import { createContext, useContext } from "react";

import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/types";

interface LocaleValue {
  locale: Locale;
  dict: Dictionary;
  isRtl: boolean;
  /** Prefix a path with the active locale: href("/collection"). */
  href: (path: string) => string;
}

const Ctx = createContext<LocaleValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value: LocaleValue = {
    locale,
    dict: getDictionary(locale),
    isRtl: locale === "ar",
    href: (path) => `/${locale}${path === "/" ? "" : path}`,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
