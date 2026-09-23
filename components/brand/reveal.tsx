"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  imageClip,
  imageScale,
  inView,
  reveal,
  revealGroup,
  stagger,
} from "@/lib/motion";

/* Scroll reveals. Every one of these renders its end state immediately when
   the user prefers reduced motion — no transform, no fade-in delay. */

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
} & Omit<DivProps, "variants" | "initial" | "whileInView" | "viewport">) {
  const reduced = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  if (reduced) {
    const Static = as as React.ElementType;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      className={className}
      variants={reveal}
      {...inView}
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
  const reduced = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  if (reduced) {
    const Static = as as React.ElementType;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp className={className} variants={revealGroup(step)} {...inView}>
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

/** Image reveal: clip-path wipes up from the bottom edge as the image settles. */
export function ImageReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      variants={imageClip}
      {...inView}
    >
      <motion.div className="relative size-full" variants={imageScale}>
        {children}
      </motion.div>
    </motion.div>
  );
}
