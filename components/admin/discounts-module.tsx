"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { MoButton } from "@/components/brand/button";
import {
  AdminCard,
  AdminField,
  TableShell,
  Td,
  Th,
  adminInput,
} from "@/components/admin/ui";
import { StatusPill } from "@/components/brand/primitives";
import { useLocale } from "@/components/providers/locale-provider";
import { createCoupon, toggleCoupon } from "@/lib/actions";
import { count, iso } from "@/lib/format";
import type { Coupon } from "@/lib/types";

export function DiscountsModule({ coupons }: { coupons: Coupon[] }) {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();

  const [code, setCode] = useState("");
  const [pct, setPct] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onCreate() {
    start(async () => {
      const res = await createCoupon(code, Number(pct));
      if (res.ok) {
        toast.success(dict.admin.couponCreated);
        setCode("");
        setPct("");
        setErrors({});
        router.refresh();
      } else {
        setErrors({
          code:
            res.errors.code === "duplicate"
              ? dict.admin.couponDuplicate
              : res.errors.code
                ? dict.admin.couponBadFormat
                : "",
          pct: res.errors.pct ? dict.admin.couponBadPct : "",
        });
        toast.error(dict.admin.errorSummary);
      }
    });
  }

  function onToggle(id: string) {
    start(async () => {
      await toggleCoupon(id);
      toast.success(dict.admin.savedOk);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <AdminCard className="min-w-0">
        <TableShell minWidth={520}>
          <thead>
            <tr>
              <Th>{dict.admin.colCode}</Th>
              <Th align="end">{dict.admin.colValue}</Th>
              <Th align="end">{dict.admin.colUsed}</Th>
              <Th>{dict.admin.colStatus}</Th>
              <Th align="end">{dict.admin.colActions}</Th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-[var(--aqua-soft)]">
                <Td>
                  <span
                    dir="ltr"
                    className="text-sm font-bold tracking-[0.06em]"
                  >
                    {c.code}
                  </span>
                </Td>
                <Td align="end">
                  {locale === "ar" ? `${iso(c.pct)}٪` : `${c.pct}%`}
                </Td>
                <Td align="end">{count(c.used, locale)}</Td>
                <Td>
                  <StatusPill tone={c.on ? "success" : "neutral"}>
                    {c.on ? dict.admin.active : dict.admin.paused}
                  </StatusPill>
                </Td>
                <Td align="end">
                  <button
                    type="button"
                    onClick={() => onToggle(c.id)}
                    disabled={pending}
                    className="text-[13px] text-[var(--aqua-ink)] underline decoration-[var(--aqua)] underline-offset-4"
                  >
                    {c.on ? dict.admin.pause : dict.admin.activate}
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </AdminCard>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <AdminCard title={dict.admin.newCoupon}>
          <div className="flex flex-col gap-4">
            <AdminField label={dict.admin.couponCode} error={errors.code}>
              <input
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={adminInput(Boolean(errors.code))}
              />
            </AdminField>
            <AdminField label={dict.admin.percent} error={errors.pct}>
              <input
                dir="ltr"
                type="number"
                min={1}
                max={90}
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                className={adminInput(Boolean(errors.pct))}
              />
            </AdminField>
            <MoButton size="admin" block onClick={onCreate} loading={pending}>
              {dict.admin.create}
            </MoButton>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
