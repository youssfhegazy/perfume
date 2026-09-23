"use client";

import { X } from "lucide-react";

import { useLocale } from "@/components/providers/locale-provider";
import { useSessionFlag } from "@/lib/hooks/use-persisted-state";

/** Deep band, dismissible, hidden for the rest of the session. */
export function AnnouncementBar() {
  const { dict } = useLocale();
  const [dismissed, setDismissed] = useSessionFlag("mo:announcement-dismissed");

  if (dismissed) return null;

  return (
    <div className="relative bg-[var(--deep)] text-[var(--on-deep)]">
      <div className="shell page-x flex min-h-10 items-center justify-center py-2.5">
        <p className="flex items-center gap-2 text-center text-[12px] font-semibold uppercase tracking-[0.14em]">
          <span
            className="size-1 shrink-0 rounded-full bg-[var(--aqua)]"
            aria-hidden
          />
          {dict.announcement}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={dict.dismiss}
        className="absolute inset-y-0 end-2 grid w-10 place-items-center text-[var(--on-deep)]/80 transition-colors hover:text-[var(--on-deep)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--on-deep)]"
      >
        <X className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
