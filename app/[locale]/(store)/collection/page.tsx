import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CollectionView } from "@/components/store/collection-view";
import { Skeleton } from "@/components/ui/skeleton";
import { getLiveProducts } from "@/lib/data";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/collection">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return { title: d.plp.title, description: d.plp.intro };
}

export default async function CollectionPage({
  params,
}: PageProps<"/[locale]/collection">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const products = await getLiveProducts();

  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <CollectionView products={products} />
    </Suspense>
  );
}

function CollectionSkeleton() {
  return (
    <div className="shell page-x py-10 lg:py-16">
      <Skeleton className="mb-6 h-4 w-40" />
      <Skeleton className="mb-10 h-14 w-80" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}
