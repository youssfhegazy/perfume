import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductView } from "@/components/store/product-view";
import { getLiveProducts, getProduct } from "@/lib/data";
import { displayName, fromPrice, isSoldOut } from "@/lib/format";
import { isLocale, LOCALES } from "@/lib/i18n/dictionary";
import { productGallery } from "@/lib/images";

export async function generateStaticParams() {
  const products = await getLiveProducts();
  return LOCALES.flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/product/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProduct(slug);
  if (!product) return {};

  const name = displayName(product, locale);
  return {
    title: name,
    description: product.desc[locale],
    alternates: {
      canonical: `/${locale}/product/${slug}`,
      languages: {
        en: `/en/product/${slug}`,
        ar: `/ar/product/${slug}`,
      },
    },
    openGraph: {
      title: name,
      description: product.desc[locale],
      images: [productGallery(product)[0]],
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/product/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const products = await getLiveProducts();
  const product = products.find((p) => p.id === slug);
  if (!product) notFound();

  // Same family first, then anything else, up to four.
  const related = [
    ...products.filter((p) => p.id !== product.id && p.fam === product.fam),
    ...products.filter((p) => p.id !== product.id && p.fam !== product.fam),
  ].slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName(product, locale),
    description: product.desc[locale],
    sku: product.sku,
    image: productGallery(product),
    brand: { "@type": "Brand", name: "Maison Oud" },
    aggregateRating: product.reviews
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviews,
        }
      : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EGP",
      lowPrice: fromPrice(product),
      highPrice: Math.max(...product.variants.map((v) => v.p)),
      offerCount: product.variants.length,
      availability: isSoldOut(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductView product={product} related={related} />
    </>
  );
}
