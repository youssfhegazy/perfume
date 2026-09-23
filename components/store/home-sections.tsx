"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { MoButton, MoLink } from "@/components/brand/button";
import { Overline, Stars } from "@/components/brand/primitives";
import { ImageReveal, Reveal, RevealGroup, RevealItem } from "@/components/brand/reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { ProductCard } from "@/components/store/product-card";
import { cn } from "@/lib/utils";
import { subscribeToNewsletter } from "@/lib/actions";
import { isEmail } from "@/lib/validation";
import { count, FAMILIES, FAMILY_ACCENT } from "@/lib/format";
import { plural } from "@/lib/i18n/dictionary";
import { HERO_PORTRAIT, NOTE_GALLERY, STORY_IMAGE } from "@/lib/images";
import { dur, ease } from "@/lib/motion";
import type { Product, Testimonial } from "@/lib/types";

/* ---------------------------------- Hero --------------------------------- */

export function Hero() {
  const { dict, href } = useLocale();
  const reduced = useReducedMotion();

  return (
    <section className="shell page-x grid items-center gap-12 pt-12 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-16 lg:pb-24">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, ease: ease.scent }}
        className="flex flex-col items-start gap-6"
      >
        <Overline>{dict.home.heroOverline}</Overline>
        <h1 className="display-xl max-w-[12ch]">{dict.home.heroTitle}</h1>
        <p className="max-w-[46ch] text-base leading-relaxed text-[var(--ink-muted)]">
          {dict.home.heroBody}
        </p>
        <div className="flex flex-wrap gap-3">
          <MoLink href={href("/collection")}>{dict.home.heroCta}</MoLink>
          <MoLink href={href("/collection")} variant="outline">
            {dict.home.heroCta2}
          </MoLink>
        </div>
      </motion.div>

      <ImageReveal className="stage">
        <Image
          src={HERO_PORTRAIT}
          alt={dict.home.heroTitle}
          fill
          sizes="(min-width:1024px) 46vw, 100vw"
          priority
          className="object-cover"
        />
      </ImageReveal>
    </section>
  );
}

/* -------------------------------- Families -------------------------------- */

export function FamilyTiles({ products }: { products: Product[] }) {
  const { dict, locale, href } = useLocale();

  return (
    <section className="shell page-x rhythm">
      <Reveal className="mb-8 flex flex-col gap-3">
        <Overline>{dict.home.familiesTitle}</Overline>
        <h2 className="heading max-w-[24ch]">{dict.home.familiesBody}</h2>
      </Reveal>

      <RevealGroup
        as="ul"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6"
      >
        {FAMILIES.map((fam) => {
          const n = products.filter((p) => p.fam === fam).length;
          const accent = FAMILY_ACCENT[fam];
          return (
            <RevealItem as="li" key={fam}>
              <Link
                href={href(`/collection?family=${fam}`)}
                className="flex h-full flex-col gap-1 border border-[var(--line)] bg-[var(--surface-raised)] p-6 transition-shadow hover:shadow-[var(--shadow-soft)]"
                style={{ borderTop: `2px solid ${accent.accent}` }}
              >
                <span className="text-[22px] leading-snug [font-family:var(--font-display-family)]">
                  {dict.families[fam]}
                </span>
                <span className="num text-[13px] text-[var(--ink-muted)]">
                  {count(n, locale)} {plural(dict.plp.results, n, locale)}
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}

/* ------------------------------ Bestsellers ------------------------------ */

export function Bestsellers({ products }: { products: Product[] }) {
  const { dict } = useLocale();

  return (
    <section className="shell page-x rhythm">
      <Reveal className="mb-8 flex flex-col gap-3">
        <Overline>{dict.home.bestsellersOverline}</Overline>
        <h2 className="heading">{dict.home.bestsellersTitle}</h2>
      </Reveal>

      <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.slice(0, 4).map((p) => (
          <RevealItem key={p.id}>
            <ProductCard product={p} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

/* --------------------------------- Story --------------------------------- */

export function StoryBand() {
  const { dict, href } = useLocale();

  return (
    <section className="bg-[var(--deep)] text-[var(--on-deep)]">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <ImageReveal className="relative aspect-square w-full overflow-hidden bg-[var(--surface-sunken)]">
          <Image
            src={STORY_IMAGE}
            alt={dict.home.storyTitle}
            fill
            sizes="(min-width:1024px) 45vw, 100vw"
            className="object-cover"
          />
        </ImageReveal>

        <Reveal className="flex flex-col items-start justify-center gap-6 px-4 py-16 sm:px-8 lg:px-24 lg:py-24">
          <Overline className="text-[var(--aqua)]">
            {dict.home.storyOverline}
          </Overline>
          <h2 className="heading max-w-[18ch] font-normal">
            {dict.home.storyTitle}
          </h2>
          <p className="max-w-[52ch] text-base leading-[28px] text-[var(--on-deep)]/86">
            {dict.home.storyBody}
          </p>
          <MoLink href={href("/collection")} variant="onDeep">
            {dict.home.storyCta}
          </MoLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- Notes gallery ----------------------------- */

export function NotesGallery() {
  const { dict, locale } = useLocale();

  return (
    <section className="shell page-x rhythm">
      <Reveal className="mb-8 flex flex-col gap-3">
        <Overline>{dict.home.notesOverline}</Overline>
        <h2 className="heading">{dict.home.notesTitle}</h2>
      </Reveal>

      <RevealGroup
        as="ul"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6"
      >
        {NOTE_GALLERY.map((note) => (
          <RevealItem as="li" key={note.src} className="flex min-w-0 flex-col">
            <div className="relative aspect-square w-full overflow-hidden bg-[var(--surface-sunken)]">
              <Image
                src={note.src}
                alt={locale === "ar" ? note.ar : note.en}
                fill
                sizes="(min-width:1024px) 23vw, 50vw"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-[20px] leading-snug [font-family:var(--font-display-family)]">
              {locale === "ar" ? note.ar : note.en}
            </p>
            <p className="text-[13px] text-[var(--ink-muted)]">
              {dict.families[note.fam]}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ------------------------------ Testimonials ----------------------------- */

export function Testimonials({ items }: { items: Testimonial[] }) {
  const { dict, locale } = useLocale();

  // The whole section hides when nothing is approved.
  if (!items.length) return null;

  return (
    <section className="shell page-x rhythm">
      <Reveal className="mb-8 flex flex-col gap-3">
        <Overline>{dict.home.testimonialsOverline}</Overline>
        <h2 className="heading">{dict.home.testimonialsTitle}</h2>
      </Reveal>

      <RevealGroup
        as="ul"
        className="hairline grid gap-8 pt-12 lg:grid-cols-3 lg:gap-12"
      >
        {items.slice(0, 3).map((item) => (
          <RevealItem as="li" key={item.id} className="flex flex-col gap-4">
            <Stars value={item.stars} />
            <blockquote className="text-[24px] leading-snug font-medium italic [font-family:var(--font-display-family)]">
              “{item.body[locale]}”
            </blockquote>
            <p className="text-[13px] text-[var(--ink-muted)]">
              {item.author[locale]}
              {item.location[locale] ? ` · ${item.location[locale]}` : ""} ·{" "}
              {item.product}
            </p>

            {item.reply ? (
              <div className="border-s-2 border-[var(--aqua)] ps-4">
                <p className="eyebrow mb-1 text-[var(--aqua-ink)]">
                  {dict.admin.replyLabel}
                </p>
                <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                  {item.reply[locale] || item.reply.en}
                </p>
              </div>
            ) : null}
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ------------------------------- Newsletter ------------------------------ */

export function Newsletter() {
  const { dict, locale } = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) {
      setState("error");
      setMessage(dict.home.newsletterInvalid);
      return;
    }
    setState("sending");
    const res = await subscribeToNewsletter(email, locale);
    if (res.ok) {
      setState("done");
      setMessage(dict.home.newsletterDone);
      setEmail("");
    } else {
      setState("error");
      setMessage(
        res.errors.email ? dict.home.newsletterInvalid : dict.home.newsletterFailed,
      );
    }
  }

  return (
    <section className="shell page-x pb-16 lg:pb-24">
      {/* minmax(0,…) on the track: an auto track is sized by the email input's
          intrinsic width, which is wider than the band at phone widths. */}
      <Reveal className="grid grid-cols-[minmax(0,1fr)] gap-8 bg-[var(--pearl)] p-8 text-[#10262b] lg:grid-cols-2 lg:items-center lg:p-12">
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-[28px] leading-snug [font-family:var(--font-display-family)]">
            {dict.home.newsletterTitle}
          </h2>
          <p className="max-w-[46ch] text-sm leading-relaxed opacity-75">
            {dict.home.newsletterBody}
          </p>
        </div>

        <form className="flex min-w-0 flex-col gap-3 sm:flex-row" onSubmit={subscribe}>
          <label className="sr-only" htmlFor="newsletter-email">
            {dict.home.newsletterPlaceholder}
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={state === "error"}
            placeholder={dict.home.newsletterPlaceholder}
            className={cn(
              "min-h-11 w-full min-w-0 flex-1 rounded-[var(--r-sm)] border bg-white/70 px-3 text-base text-[#10262b]",
              "placeholder:text-[#10262b]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]",
              state === "error"
                ? "border-[var(--danger)]"
                : "border-[#10262b]/25",
            )}
          />
          <MoButton
            type="submit"
            className="shrink-0"
            loading={state === "sending"}
          >
            {dict.home.newsletterCta}
          </MoButton>
        </form>

        {message ? (
          <p
            role="status"
            className={cn(
              "text-sm font-semibold lg:col-span-2",
              state === "error"
                ? "text-[var(--danger)]"
                : "text-[var(--success)]",
            )}
          >
            {message}
          </p>
        ) : null}
      </Reveal>
    </section>
  );
}
