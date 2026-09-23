"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { MoButton } from "@/components/brand/button";
import { MediaUploader } from "@/components/admin/media-uploader";
import {
  AdminCard,
  AdminField,
  TableShell,
  Td,
  Th,
  adminInput,
} from "@/components/admin/ui";
import { Overline } from "@/components/brand/primitives";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { saveProduct } from "@/lib/actions";
import { CONCENTRATIONS, count, FAMILIES } from "@/lib/format";
import { t } from "@/lib/i18n/dictionary";
import { DESC_MAX } from "@/lib/validation";
import type {
  Concentration,
  Family,
  ScentNote,
  Product,
  ProductStatus,
} from "@/lib/types";

type Tier = "top" | "heart" | "base";

export function ProductEditor({ product }: { product: Product }) {
  const { dict, locale, href } = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();

  const [draft, setDraft] = useState<Product>(product);
  const [tab, setTab] = useState<"en" | "ar">("en");
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagDraft, setTagDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState<Record<Tier, string>>({
    top: "",
    heart: "",
    base: "",
  });

  function patch(next: Partial<Product>) {
    setDraft((d) => ({ ...d, ...next }));
    setTouched(true);
  }

  /* Validation is deferred until first submit; a pristine form shows nothing. */
  function validate(d: Product) {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e["name"] = dict.checkout.required;
    if (d.desc.en.length > DESC_MAX) e["desc.en"] = dict.admin.errorSummary;
    if (d.desc.ar.length > DESC_MAX) e["desc.ar"] = dict.admin.errorSummary;
    d.variants.forEach((v, i) => {
      if (!Number.isFinite(v.p) || v.p <= 0)
        e[`variants.${i}.p`] = dict.admin.priceBad;
    });
    return e;
  }

  function onSave() {
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error(dict.admin.errorSummary);
      return;
    }
    start(async () => {
      const res = await saveProduct(draft);
      if (res.ok) {
        toast.success(dict.admin.savedOk);
        setTouched(false);
        router.push(href("/admin/products"));
      } else {
        setErrors(
          Object.fromEntries(
            Object.keys(res.errors).map((k) => [k, dict.admin.errorSummary]),
          ),
        );
        toast.error(dict.admin.errorSummary);
      }
    });
  }

  function addNote(tier: Tier) {
    const value = noteDraft[tier].trim();
    if (!value) return;
    patch({
      notes: {
        ...draft.notes,
        [tier]: [...draft.notes[tier], { en: value, ar: value } as ScentNote],
      },
    });
    setNoteDraft((n) => ({ ...n, [tier]: "" }));
  }

  function removeNote(tier: Tier, index: number) {
    patch({
      notes: {
        ...draft.notes,
        [tier]: draft.notes[tier].filter((_, i) => i !== index),
      },
    });
  }

  const nameValue = tab === "en" ? draft.name : draft.ar;
  const descValue = draft.desc[tab];
  const descLeft = DESC_MAX - descValue.length;
  const hasErrors = Object.keys(errors).length > 0;

  const tiers: Array<{ key: Tier; label: string }> = [
    { key: "top", label: dict.pdp.top },
    { key: "heart", label: dict.pdp.heart },
    { key: "base", label: dict.pdp.base },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-6">
        <AdminCard>
          {/* EN / العربية segmented control */}
          <div
            role="tablist"
            aria-label={dict.admin.nameEn}
            className="mb-5 inline-flex gap-1 rounded-[var(--r-md)] bg-[var(--surface-sunken)] p-[3px]"
          >
            {(["en", "ar"] as const).map((l) => (
              <button
                key={l}
                role="tab"
                aria-selected={tab === l}
                onClick={() => setTab(l)}
                className={cn(
                  "min-h-8 rounded-[calc(var(--r-md)-2px)] px-4 text-[13px] font-semibold transition-colors",
                  tab === l
                    ? "bg-[var(--surface-raised)] shadow-[var(--shadow-soft)]"
                    : "text-[var(--ink-muted)]",
                )}
              >
                {l === "en" ? "EN" : "العربية"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <AdminField
              label={tab === "en" ? dict.admin.nameEn : dict.admin.nameAr}
              error={tab === "en" ? errors["name"] : undefined}
            >
              <input
                dir={tab === "ar" ? "rtl" : "ltr"}
                value={nameValue}
                onChange={(e) =>
                  patch(tab === "en" ? { name: e.target.value } : { ar: e.target.value })
                }
                className={adminInput(tab === "en" && Boolean(errors["name"]))}
              />
            </AdminField>

            <AdminField
              label={tab === "en" ? dict.admin.descEn : dict.admin.descAr}
              hint={
                descLeft >= 0
                  ? t(dict.admin.charsLeft, { n: count(descLeft, locale) })
                  : undefined
              }
              error={
                descLeft < 0
                  ? t(dict.admin.charsOver, { n: count(Math.abs(descLeft), locale) })
                  : undefined
              }
            >
              <textarea
                dir={tab === "ar" ? "rtl" : "ltr"}
                rows={4}
                value={descValue}
                onChange={(e) =>
                  patch({ desc: { ...draft.desc, [tab]: e.target.value } })
                }
                className={cn(adminInput(descLeft < 0), "min-h-24 py-2")}
              />
            </AdminField>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label={dict.admin.sku}>
                <input
                  dir="ltr"
                  value={draft.sku}
                  onChange={(e) => patch({ sku: e.target.value })}
                  className={adminInput()}
                />
              </AdminField>

              <AdminField label={dict.admin.family}>
                <select
                  value={draft.fam}
                  onChange={(e) => patch({ fam: e.target.value as Family })}
                  className={adminInput()}
                >
                  {FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {dict.families[f]}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label={dict.plp.concentration}>
                <select
                  value={draft.conc}
                  onChange={(e) =>
                    patch({ conc: e.target.value as Concentration })
                  }
                  className={adminInput()}
                >
                  {CONCENTRATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <AdminField label={dict.admin.tags}>
              <>
                <ul className="mb-2 flex flex-wrap gap-1.5">
                  {draft.tags.map((tag) => (
                    <li
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-[var(--r-full)] bg-[var(--aqua-soft)] py-1 ps-2.5 pe-1 text-[12px] text-[var(--aqua-ink)]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          patch({ tags: draft.tags.filter((x) => x !== tag) })
                        }
                        aria-label={`${dict.admin.delete} ${tag}`}
                        className="grid size-4 place-items-center rounded-full hover:bg-[var(--aqua)]/30"
                      >
                        <X className="size-2.5" strokeWidth={2.5} />
                      </button>
                    </li>
                  ))}
                </ul>
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const tag = tagDraft.trim();
                    if (!tag || draft.tags.includes(tag)) return;
                    patch({ tags: [...draft.tags, tag] });
                    setTagDraft("");
                  }}
                  placeholder={dict.admin.tagAdd}
                  className={adminInput()}
                />
              </>
            </AdminField>
          </div>
        </AdminCard>

        {/* Variants */}
        <AdminCard
          title={dict.admin.variants}
          action={
            <MoButton
              size="admin"
              variant="subtle"
              onClick={() => {
                const last = draft.variants.at(-1);
                patch({
                  variants: [
                    ...draft.variants,
                    { ml: last ? last.ml * 2 : 50, p: 0, stock: 0 },
                  ],
                });
              }}
            >
              <Plus className="size-3.5" strokeWidth={2} />
              {dict.admin.addVariant}
            </MoButton>
          }
        >
          <TableShell minWidth={480}>
            <thead>
              <tr>
                <Th>{dict.admin.size}</Th>
                <Th>{dict.admin.price}</Th>
                <Th>{dict.admin.stock}</Th>
                <Th align="end" className="w-12">
                  <span className="sr-only">{dict.admin.colActions}</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {draft.variants.map((v, i) => {
                const priceError = errors[`variants.${i}.p`];
                return (
                  <tr key={i}>
                    <Td>
                      <input
                        dir="ltr"
                        type="number"
                        value={v.ml}
                        onChange={(e) => {
                          const variants = [...draft.variants];
                          variants[i] = { ...v, ml: Number(e.target.value) };
                          patch({ variants });
                        }}
                        className={cn(adminInput(), "max-w-24")}
                      />
                    </Td>
                    <Td>
                      <input
                        dir="ltr"
                        type="number"
                        value={v.p}
                        onChange={(e) => {
                          const variants = [...draft.variants];
                          variants[i] = { ...v, p: Number(e.target.value) };
                          patch({ variants });
                        }}
                        aria-invalid={Boolean(priceError)}
                        className={cn(adminInput(Boolean(priceError)), "max-w-28")}
                      />
                      {priceError ? (
                        <span className="mt-1 block text-[12px] text-[var(--danger)]">
                          {priceError}
                        </span>
                      ) : null}
                    </Td>
                    <Td>
                      <input
                        dir="ltr"
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const variants = [...draft.variants];
                          variants[i] = { ...v, stock: Number(e.target.value) };
                          patch({ variants });
                        }}
                        className={cn(adminInput(), "max-w-24")}
                      />
                    </Td>
                    <Td align="end">
                      <button
                        type="button"
                        onClick={() =>
                          patch({
                            variants: draft.variants.filter((_, n) => n !== i),
                          })
                        }
                        aria-label={dict.admin.delete}
                        className="grid size-8 place-items-center rounded-[var(--r-md)] text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                      >
                        <X className="size-4" strokeWidth={1.5} />
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </AdminCard>

        {/* Notes & accords */}
        <AdminCard title={dict.admin.notesAccords}>
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div key={tier.key} className="flex min-w-0 flex-col gap-3">
                <Overline className="w-fit border-b border-[var(--aqua)] pb-1">
                  {tier.label}
                </Overline>
                <ul className="flex flex-wrap gap-1.5">
                  {draft.notes[tier.key].map((note, i) => (
                    <li
                      key={`${note.en}-${i}`}
                      className="inline-flex items-center gap-1 rounded-[var(--r-full)] bg-[var(--aqua-soft)] py-1 ps-2.5 pe-1 text-[12px] text-[var(--aqua-ink)]"
                    >
                      {locale === "ar" ? note.ar : note.en}
                      <button
                        type="button"
                        onClick={() => removeNote(tier.key, i)}
                        aria-label={`${dict.admin.delete} ${note.en}`}
                        className="grid size-4 place-items-center rounded-full hover:bg-[var(--aqua)]/30"
                      >
                        <X className="size-2.5" strokeWidth={2.5} />
                      </button>
                    </li>
                  ))}
                </ul>
                <input
                  value={noteDraft[tier.key]}
                  onChange={(e) =>
                    setNoteDraft((n) => ({ ...n, [tier.key]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNote(tier.key);
                    }
                  }}
                  placeholder={dict.admin.addNote}
                  aria-label={`${dict.admin.addNote} — ${tier.label}`}
                  className={adminInput()}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <AdminField
              label={`${dict.admin.longevity} — ${draft.lon}/5`}
            >
              <input
                type="range"
                min={1}
                max={5}
                value={draft.lon}
                onChange={(e) => patch({ lon: Number(e.target.value) })}
                className="w-full accent-[var(--primary-c)]"
              />
            </AdminField>
            <AdminField label={`${dict.admin.sillage} — ${draft.sil}/5`}>
              <input
                type="range"
                min={1}
                max={5}
                value={draft.sil}
                onChange={(e) => patch({ sil: Number(e.target.value) })}
                className="w-full accent-[var(--primary-c)]"
              />
            </AdminField>
          </div>
        </AdminCard>
      </div>

      {/* Sidebar */}
      <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <AdminCard title={dict.admin.publishing}>
          <div className="flex flex-col gap-4">
            <AdminField label={dict.admin.statusLabel}>
              <select
                value={draft.status}
                onChange={(e) =>
                  patch({ status: e.target.value as ProductStatus })
                }
                className={adminInput()}
              >
                <option value="live">{dict.status.live}</option>
                <option value="draft">{dict.status.draft}</option>
                <option value="archived">{dict.status.archived}</option>
              </select>
            </AdminField>

            {hasErrors ? (
              <div
                role="alert"
                className="rounded-[var(--r-md)] bg-[var(--danger-soft)] p-3 text-[13px] text-[var(--danger)]"
              >
                {dict.admin.errorSummary}
              </div>
            ) : null}

            <MoButton size="admin" block onClick={onSave} loading={pending}>
              {dict.admin.save}
            </MoButton>
            <MoButton
              size="admin"
              variant="subtle"
              block
              disabled={!touched}
              onClick={() => {
                setDraft(product);
                setErrors({});
                setTouched(false);
              }}
            >
              {dict.admin.discard}
            </MoButton>
          </div>
        </AdminCard>

        <AdminCard title={dict.admin.media}>
          <MediaUploader product={product} />
        </AdminCard>
      </div>
    </div>
  );
}
