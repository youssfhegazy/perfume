"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { MoButton } from "@/components/brand/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Stars } from "@/components/brand/primitives";
import {
  AdminCard,
  AdminField,
  FilterPill,
  ReviewStatusPill,
  adminInput,
} from "@/components/admin/ui";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  deleteTestimonial,
  replyToTestimonial,
  saveTestimonial,
  setTestimonialStatus,
} from "@/lib/actions";
import { count, displayName } from "@/lib/format";
import { TESTIMONIAL_MIN } from "@/lib/validation";
import type { Product, Testimonial, TestimonialStatus } from "@/lib/types";

export function ReviewsModule({
  testimonials,
  products,
}: {
  testimonials: Testimonial[];
  products: Product[];
}) {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<TestimonialStatus | "all">("pending");

  // Composer
  const [author, setAuthor] = useState("");
  const [productName, setProductName] = useState(products[0]?.name ?? "");
  const [stars, setStars] = useState(5);
  const [quote, setQuote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  function openReply(tst: Testimonial) {
    setReplyingTo(tst.id);
    setReplyDraft(tst.reply?.en ?? "");
  }

  function submitReply(id: string, value: string) {
    start(async () => {
      const res = await replyToTestimonial(id, value);
      if (res.ok) {
        toast.success(value.trim() ? dict.admin.replySaved : dict.admin.replyRemoved);
        setReplyingTo(null);
        router.refresh();
      } else {
        toast.error(dict.admin.errorSummary);
      }
    });
  }

  const rows = useMemo(
    () =>
      filter === "all"
        ? testimonials
        : testimonials.filter((t) => t.status === filter),
    [testimonials, filter],
  );

  function act(id: string, status: TestimonialStatus) {
    start(async () => {
      await setTestimonialStatus(id, status);
      toast.success(dict.admin.savedOk);
      router.refresh();
    });
  }

  function confirmDelete() {
    const tst = toDelete;
    if (!tst) return;
    start(async () => {
      await deleteTestimonial(tst.id);
      toast.success(dict.admin.deleted);
      setToDelete(null);
      router.refresh();
    });
  }

  function onCreate() {
    const e: Record<string, string> = {};
    if (!author.trim()) e.author = dict.admin.minChars;
    if (quote.trim().length < TESTIMONIAL_MIN) e.quote = dict.admin.minChars;
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error(dict.admin.errorSummary);
      return;
    }

    // The composer writes one string to both languages — the handoff flags
    // splitting this into two fields as a follow-up.
    const testimonial: Testimonial = {
      id: `t-${Date.now()}`,
      status: "approved",
      stars: stars as 1 | 2 | 3 | 4 | 5,
      product: productName,
      author: { en: author, ar: author },
      location: { en: "", ar: "" },
      body: { en: quote, ar: quote },
      reply: null,
    };

    start(async () => {
      const res = await saveTestimonial(testimonial);
      if (res.ok) {
        toast.success(dict.admin.testimonialAdded);
        setAuthor("");
        setQuote("");
        setErrors({});
        router.refresh();
      } else {
        toast.error(dict.admin.errorSummary);
      }
    });
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["pending", "approved", "all"] as const).map((f) => (
            <FilterPill
              key={f}
              active={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? dict.admin.all : dict.status[f]}
            </FilterPill>
          ))}
          <p className="num ms-auto text-[13px] text-[var(--ink-muted)]">
            {count(rows.length, locale)}
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {rows.map((tst) => (
            <li key={tst.id}>
              <AdminCard>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Stars value={tst.stars} />
                  <span className="text-sm font-semibold">
                    {tst.author[locale] || tst.author.en}
                  </span>
                  <span className="text-[13px] text-[var(--ink-muted)]">
                    {tst.product}
                  </span>
                  <span className="ms-auto">
                    <ReviewStatusPill status={tst.status} d={dict} />
                  </span>
                </div>

                <p className="max-w-[76ch] text-sm leading-[23px] text-[var(--ink-muted)]">
                  {tst.body[locale] || tst.body.en}
                </p>

                {tst.reply && replyingTo !== tst.id ? (
                  <div className="mt-3 border-s-2 border-[var(--aqua)] bg-[var(--aqua-soft)] px-4 py-3">
                    <p className="eyebrow mb-1 text-[var(--aqua-ink)]">
                      {dict.admin.replyLabel}
                    </p>
                    <p className="max-w-[76ch] text-sm text-[var(--ink)]">
                      {tst.reply[locale] || tst.reply.en}
                    </p>
                  </div>
                ) : null}

                {replyingTo === tst.id ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <label className="sr-only" htmlFor={`reply-${tst.id}`}>
                      {dict.admin.reply}
                    </label>
                    <textarea
                      id={`reply-${tst.id}`}
                      autoFocus
                      rows={3}
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder={dict.admin.replyPlaceholder}
                      className={cn(adminInput(), "min-h-20 py-2")}
                    />
                    <div className="flex flex-wrap gap-2">
                      <MoButton
                        size="admin"
                        onClick={() => submitReply(tst.id, replyDraft)}
                        loading={pending}
                      >
                        {dict.admin.replySave}
                      </MoButton>
                      {tst.reply ? (
                        <MoButton
                          size="admin"
                          variant="dangerSoft"
                          disabled={pending}
                          onClick={() => submitReply(tst.id, "")}
                        >
                          {dict.admin.replyRemove}
                        </MoButton>
                      ) : null}
                      <MoButton
                        size="admin"
                        variant="subtle"
                        onClick={() => setReplyingTo(null)}
                      >
                        {dict.admin.cancel}
                      </MoButton>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <MoButton
                    size="admin"
                    variant="subtle"
                    disabled={pending || tst.status === "approved"}
                    onClick={() => act(tst.id, "approved")}
                  >
                    {dict.admin.approve}
                  </MoButton>
                  <MoButton
                    size="admin"
                    variant="dangerSoft"
                    disabled={pending || tst.status === "rejected"}
                    onClick={() => act(tst.id, "rejected")}
                  >
                    {dict.admin.reject}
                  </MoButton>
                  <MoButton
                    size="admin"
                    variant="dangerSoft"
                    disabled={pending}
                    onClick={() => setToDelete(tst)}
                  >
                    {dict.admin.delete}
                  </MoButton>
                  <MoButton
                    size="admin"
                    variant="ghost"
                    onClick={() => openReply(tst)}
                  >
                    {dict.admin.reply}
                  </MoButton>
                </div>
              </AdminCard>
            </li>
          ))}
        </ul>
      </div>

      {/* Composer */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <AdminCard title={dict.admin.newTestimonial}>
          <div className="flex flex-col gap-4">
            <AdminField label={dict.admin.author} error={errors.author}>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={adminInput(Boolean(errors.author))}
              />
            </AdminField>

            <AdminField label={dict.admin.product}>
              <select
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className={adminInput()}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {displayName(p, locale)}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label={dict.admin.rating}>
              <select
                value={stars}
                onChange={(e) => setStars(Number(e.target.value))}
                className={adminInput()}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label={dict.admin.quote} error={errors.quote}>
              <textarea
                rows={4}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className={cn(
                  adminInput(Boolean(errors.quote)),
                  "min-h-24 py-2",
                )}
              />
            </AdminField>

            <MoButton size="admin" block onClick={onCreate} loading={pending}>
              {dict.admin.addTestimonial}
            </MoButton>

            <p className="text-[12px] text-[var(--ink-muted)]">
              {dict.admin.testimonialNote}
            </p>
          </div>
        </AdminCard>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        name={toDelete ? toDelete.author.en || toDelete.product : ""}
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
