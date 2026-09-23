"use client";

import { useEffect } from "react";

import { MoButton } from "@/components/brand/button";
import { Overline } from "@/components/brand/primitives";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Wire this to your error reporter.
    console.error(error);
  }, [error]);

  return (
    <div className="page-x mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-5 py-24 text-center">
      <Overline>500</Overline>
      <h1 className="display-lg">Something went wrong.</h1>
      <p className="text-base text-[var(--ink-muted)]">
        The page could not be loaded. Try again — if it keeps happening, let us
        know.
      </p>
      <MoButton onClick={reset}>Try again</MoButton>
    </div>
  );
}
