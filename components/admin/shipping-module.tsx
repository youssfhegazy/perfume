"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { MoButton } from "@/components/brand/button";
import {
  AdminCard,
  TableShell,
  Td,
  Th,
  adminInput,
} from "@/components/admin/ui";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { saveZones } from "@/lib/actions";
import { isFee } from "@/lib/validation";
import type { ShippingZone } from "@/lib/types";

export function ShippingModule({ zones }: { zones: ShippingZone[] }) {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();

  // Fees are edited as strings so a cleared field stays blank (and invalid)
  // instead of snapping to 0.
  const [draft, setDraft] = useState(() =>
    zones.map((z) => ({ ...z, feeInput: String(z.fee) })),
  );
  const [showErrors, setShowErrors] = useState(false);

  const invalid = draft.filter((z) => !isFee(z.feeInput));

  function onSave() {
    setShowErrors(true);
    if (invalid.length) {
      toast.error(dict.admin.errorSummary);
      return;
    }
    start(async () => {
      const res = await saveZones(
        draft.map(({ feeInput, ...z }) => ({ ...z, fee: Number(feeInput) })),
      );
      if (res.ok) {
        toast.success(dict.admin.zonesSaved);
        setShowErrors(false);
        router.refresh();
      } else {
        toast.error(dict.admin.errorSummary);
      }
    });
  }

  return (
    <AdminCard>
      <TableShell minWidth={640}>
        <thead>
          <tr>
            <Th>{dict.admin.colGovernorate}</Th>
            <Th>{dict.admin.colFee}</Th>
            <Th>{dict.admin.colEta}</Th>
            <Th>{dict.admin.colCod}</Th>
          </tr>
        </thead>
        <tbody>
          {draft.map((z, i) => {
            const bad = showErrors && !isFee(z.feeInput);
            return (
              <tr key={z.id}>
                <Td>{z.gov[locale]}</Td>
                <Td>
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    value={z.feeInput}
                    onChange={(e) => {
                      const next = [...draft];
                      next[i] = { ...z, feeInput: e.target.value };
                      setDraft(next);
                    }}
                    aria-invalid={bad}
                    aria-label={`${dict.admin.colFee} — ${z.gov[locale]}`}
                    className={cn(adminInput(bad), "max-w-28")}
                  />
                  {bad ? (
                    <span className="mt-1 block text-[12px] text-[var(--danger)]">
                      {dict.admin.zoneFeeBad}
                    </span>
                  ) : null}
                </Td>
                <Td>{z.eta[locale]}</Td>
                <Td>
                  <input
                    type="checkbox"
                    checked={z.cod}
                    onChange={(e) => {
                      const next = [...draft];
                      next[i] = { ...z, cod: e.target.checked };
                      setDraft(next);
                    }}
                    aria-label={`${dict.admin.colCod} — ${z.gov[locale]}`}
                    className="size-4 accent-[var(--primary-c)]"
                  />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
        {showErrors && invalid.length ? (
          <p
            role="alert"
            className="rounded-[var(--r-md)] bg-[var(--danger-soft)] px-3 py-2 text-[13px] text-[var(--danger)]"
          >
            {dict.admin.errorSummary}
          </p>
        ) : null}
        <MoButton
          size="admin"
          className="ms-auto"
          onClick={onSave}
          loading={pending}
        >
          {dict.admin.saveZones}
        </MoButton>
      </div>
    </AdminCard>
  );
}
