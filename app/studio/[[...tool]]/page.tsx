import type { Viewport } from "next";
import { NextStudio } from "next-sanity/studio";

import config from "@/sanity.config";

/* Embedded Sanity Studio. It renders its own <html>, so it lives outside the
   [locale] tree and takes over the viewport. */

export const dynamic = "force-static";

/* The Studio manages its own chrome and needs the full viewport. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}
