import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WishlistView } from "@/components/store/wishlist-view";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/wishlist">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  // Per-device state — nothing here is worth indexing.
  return { title: d.wishlist.title, robots: { index: false } };
}

export default async function WishlistPage({
  params,
}: PageProps<"/[locale]/wishlist">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <WishlistView />;
}
