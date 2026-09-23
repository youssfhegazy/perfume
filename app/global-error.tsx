"use client";

import { useEffect } from "react";

/* Last resort: this replaces the root layout, so it must render its own
   <html> and <body> and cannot rely on the app's fonts, theme tokens or
   providers. Styles are inline for that reason. */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#f4f7f7",
          color: "#10262b",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "42ch" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#2f6b75",
              margin: 0,
            }}
          >
            500
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 400, margin: "16px 0 8px" }}>
            Something went wrong.
          </h1>
          <p style={{ color: "#4c6166", lineHeight: 1.6, margin: "0 0 24px" }}>
            The application could not start. Try again — if it keeps happening,
            let us know.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: 44,
              padding: "0 24px",
              borderRadius: 2,
              border: "1px solid #1d4e57",
              background: "#1d4e57",
              color: "#f4f7f7",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: 20, fontSize: 12, color: "#4c6166" }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
