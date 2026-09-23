import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrackView } from "@/components/store/track-view";
import { getZones } from "@/lib/data";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/track">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return { title: d.track.title, description: d.track.intro };
}

export default async function TrackPage({
  params,
  searchParams,
}: PageProps<"/[locale]/track">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const zones = await getZones();

  return (
    <TrackView
      initialId={typeof sp.id === "string" ? sp.id : ""}
      zones={zones}
    />
  );
}
