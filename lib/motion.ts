/* Framer Motion tokens. Mood: mist settling on skin — slow in, soft out.
   Nothing bounces. See the Motion section of DESIGN.md. */

import type { Transition, Variants } from "framer-motion";

export const ease = {
  scent: [0.22, 1, 0.36, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

export const dur = {
  fast: 0.18,
  base: 0.42,
  slow: 0.9,
};

export const stagger = 0.06;
/** Scent-pyramid tiers step slower than a grid. */
export const tierStagger = 0.15;

export const scent: Transition = { duration: dur.base, ease: ease.scent };
export const scentSlow: Transition = { duration: dur.slow, ease: ease.scent };
export const scentFast: Transition = { duration: dur.fast, ease: ease.scent };

/** Section reveal on scroll: opacity 0→1, translateY 24→0, 900ms. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: scentSlow },
};

/** Parent that staggers its children by 60ms. */
export const revealGroup = (step = stagger): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step } },
});

/* Image reveal: the clip wipes up on the outer box while the inner one settles
   from 1.08 to 1. They are two elements on purpose — scaling the clipped box
   itself grows its border box and pushes the layout wider. */

export const imageClip: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  show: { clipPath: "inset(0% 0 0 0)", transition: scentSlow },
};

export const imageScale: Variants = {
  hidden: { scale: 1.08 },
  show: { scale: 1, transition: scentSlow },
};

/* Shared `whileInView` config — fire once, when a fifth of the element is on
   screen.

   `amount` rather than a negative `margin`: a negative rootMargin shrinks the
   observer root, and in practice it reported "not intersecting" even for an
   element sitting in the middle of the viewport, which left every image reveal
   permanently clipped at inset(100%). `amount` expresses the same intent —
   "wait until it is meaningfully visible" — and is defined against the element
   rather than the root. */
export const inView = {
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, amount: 0.2 },
} as const;

/** Drawer/panel: backdrop fades, panel rises and settles. */
export const backdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.base, ease: ease.scent } },
  exit: { opacity: 0, transition: { duration: dur.base, ease: ease.exit } },
};

export const panelRise: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: scent },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: dur.fast } },
};

/** Bag count pop on add. */
export const countPop = {
  scale: [1, 1.2, 1],
  transition: { duration: dur.base, ease: ease.scent },
};

/** Toast in: opacity 0→1, y 12→0, 300ms. */
export const toastIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.scent } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
};

export const TOAST_DISMISS_MS = 2800;
