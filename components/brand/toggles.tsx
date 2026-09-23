"use client";

import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useLocale } from "@/components/providers/locale-provider";
import { useHydrated } from "@/lib/hooks/use-persisted-state";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n/dictionary";

/** Swaps the URL locale segment, keeping the rest of the path. */
export function LocaleToggle({
  className,
  block = false,
}: {
  className?: string;
  block?: boolean;
}) {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const next = LOCALES.find((l) => l !== locale) ?? "en";

  function swap() {
    const rest = pathname.replace(new RegExp(`^/(${LOCALES.join("|")})`), "");
    router.push(`/${next}${rest || ""}`);
  }

  return (
    <button
      type="button"
      onClick={swap}
      lang={next}
      aria-label={`${dict.nav.localeName} → ${dict.nav.locale}`}
      className={cn(
        "min-h-11 px-2 text-[13px] font-medium transition-colors hover:text-[var(--aqua-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]",
        block &&
          "flex w-full items-center justify-center rounded-[var(--r-sm)] border border-[var(--ink)] px-6",
        className,
      )}
    >
      {dict.nav.locale}
    </button>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { dict } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  // The resolved theme is only known on the client; render a stable icon on
  // the server pass so hydration matches.
  const mounted = useHydrated();

  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dict.nav.theme}
      className={cn(
        "grid min-h-11 w-11 place-items-center transition-colors hover:text-[var(--aqua-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]",
        className,
      )}
    >
      {/* Render a stable icon until mounted so the markup matches the server. */}
      {mounted && dark ? (
        <Sun className="size-[18px]" strokeWidth={1.5} />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.5} />
      )}
    </button>
  );
}
