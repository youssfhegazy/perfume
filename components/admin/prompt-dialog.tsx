"use client";

import { AnimatePresence, motion } from "framer-motion";

import { MoButton } from "@/components/brand/button";
import { AdminField, adminInput } from "@/components/admin/ui";
import { useLocale } from "@/components/providers/locale-provider";
import { useFocusTrap, useScrollLock } from "@/lib/hooks/use-focus-trap";
import { dur, ease } from "@/lib/motion";

/** A single-field dialog. Used by the bulk tag action. */
export function PromptDialog({
  open,
  title,
  label,
  value,
  error,
  placeholder,
  confirmLabel,
  pending = false,
  onChange,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  confirmLabel: string;
  pending?: boolean;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { dict } = useLocale();
  const panelRef = useFocusTrap<HTMLFormElement>(open);
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

          <motion.form
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-title"
            onSubmit={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: dur.base, ease: ease.scent }}
            className="relative w-full max-w-[420px] rounded-[var(--r-lg)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-overlay)]"
          >
            <h2 id="prompt-title" className="heading-sm mb-4 text-[22px]">
              {title}
            </h2>

            <AdminField label={label} error={error}>
              <input
                autoFocus
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={adminInput(Boolean(error))}
              />
            </AdminField>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <MoButton size="admin" variant="subtle" onClick={onCancel}>
                {dict.admin.cancel}
              </MoButton>
              <MoButton size="admin" type="submit" loading={pending}>
                {confirmLabel}
              </MoButton>
            </div>
          </motion.form>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
