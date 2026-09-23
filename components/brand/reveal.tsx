"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";


import { imageClip, imageScale, reveal, revealGroup, stagger } from "@/lib/motion";

/* Scroll reveals.

   These drive the animation from an explicit `useInView` ref rather than the
   `whileInView` prop. `whileInView` never reported an intersection for the
   image reveals here, which left them clipped at `inset(100%)` — invisible,
   permanently. Decorative motion must never be able to hide content, so the
   trigger is now something we can see and test.

   Every one of these renders its end state immediately when the user prefers
   reduced motion — no transform, no fade-in delay. */

const VIEW = { once: true, amount: 0.2 } as const;

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, VIEW);
  const reduced = useReducedMotion();
  return { ref, show: reduced || inView, reduced };
}

type DivProps = React.ComponentProps<typeof motion.div>;

export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
  delay?: number;
} & Omit<DivProps, "variants" | "initial" | "animate">) {
  const { ref, show, reduced } = useReveal<HTMLDivElement>();
  const Comp = motion[as] as typeof motion.div;

  if (reduced) {
    const Static = as as React.ElementType;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      ref={ref}
      className={className}
      variants={reveal}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      transition={delay ? { delay } : undefined}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Parent that staggers its Reveal children. */
export function RevealGroup({
  children,
  className,
  step = stagger,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  as?: "div" | "ul" | "section";
}) {
  const { ref, show, reduced } = useReveal<HTMLDivElement>();
  const Comp = motion[as] as typeof motion.div;

  if (reduced) {
    const Static = as as React.ElementType;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      ref={ref}
      className={className}
      variants={revealGroup(step)}
      initial="hidden"
      animate={show ? "show" : "hidden"}
    >
      {children}
    </Comp>
  );
}

/** Child of RevealGroup — inherits the parent's stagger. */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  if (reduced) {
    const Static = as as React.ElementType;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp className={className} variants={reveal}>
      {children}
    </Comp>
  );
}

/**
 * Image reveal: clip-path wipes up from the bottom edge as the image settles.
 *
 * Three elements, and the split matters:
 *
 * 1. The observed box. It carries the layout (aspect ratio, background) and is
 *    never clipped — `clip-path: inset(100%)` shrinks an element's intersection
 *    rect to nothing, so an observer watching the clipped element itself would
 *    never see it enter the viewport and would never un-clip it. That deadlock
 *    left every hero and story image invisible.
 * 2. The clipped box, which does the wipe.
 * 3. The scaled box — scaling the clipped box would grow its border box and
 *    push the layout wider.
 */
export function ImageReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, show, reduced } = useReveal<HTMLDivElement>();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="size-full overflow-hidden"
        variants={imageClip}
        initial="hidden"
        animate={show ? "show" : "hidden"}
      >
        <motion.div className="relative size-full" variants={imageScale}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
