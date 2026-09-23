import type { MetadataRoute } from "next";

import { getLiveProducts } from "@/lib/data";
import { LOCALES } from "@/lib/i18n/dictionary";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getLiveProducts();
  const now = new Date();

  const pages = LOCALES.flatMap((locale) => [
    { url: `${base}/${locale}`, priority: 1 },
    { url: `${base}/${locale}/collection`, priority: 0.8 },
    ...products.map((p) => ({
      url: `${base}/${locale}/product/${p.id}`,
      priority: 0.7,
    })),
  ]);

  return pages.map((p) => ({ ...p, lastModified: now, changeFrequency: "weekly" as const }));
}
