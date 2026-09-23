"use client";

import { useEffect } from "react";

import { ServerErrorState } from "@/components/brand/error-state";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ServerErrorState reset={reset} digest={error.digest} />;
}
