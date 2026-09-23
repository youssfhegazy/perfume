"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MoButton } from "@/components/brand/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useFocusTrap, useScrollLock } from "@/lib/hooks/use-focus-trap";
import { t } from "@/lib/i18n/dictionary";
import { dur, ease } from "@/lib/motion";

/* Destructive actions sit behind this. The prototype hard-deleted without
   confirming; DATA_CONTRACTS.md asks for a confirm step in production. */

export function ConfirmDialog({
  open,
  name,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  /** The thing being deleted, named in the heading. */
  name: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { dict } = useLocale();
  const panelRef = useFocusTrap<HTMLDivElement>(open);
  useScrollLock(open);

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
          }}
        >
          <motion.button
            type="button"
            aria-label={dict.admin.cancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="absolute inset-0 bg-[var(--scrim)]"
          />

          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-body"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: dur.base, ease: ease.scent }}
            className="relative w-full max-w-[420px] rounded-[var(--r-lg)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-overlay)]"
          >
            <h2 id="confirm-title" className="heading-sm mb-2 text-[22px]">
              {t(dict.admin.confirmDeleteTitle, { name })}
            </h2>
            <p
              id="confirm-body"
              className="mb-6 text-sm text-[var(--ink-muted)]"
            >
              {dict.admin.confirmDeleteBody}
            </p>

            <div className="flex flex-wrap justify-end gap-2">
              <MoButton size="admin" variant="subtle" onClick={onCancel}>
                {dict.admin.cancel}
              </MoButton>
              <MoButton
                size="admin"
                variant="danger"
                onClick={onConfirm}
                loading={pending}
              >
                {dict.admin.confirmDelete}
              </MoButton>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
