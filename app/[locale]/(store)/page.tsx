import { notFound } from "next/navigation";

import {
  Bestsellers,
  FamilyTiles,
  Hero,
  Newsletter,
  NotesGallery,
  StoryBand,
  Testimonials,
} from "@/components/store/home-sections";
import { getApprovedTestimonials, getLiveProducts } from "@/lib/data";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";
import { fromPrice } from "@/lib/format";
import { productImage } from "@/lib/images";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [products, testimonials] = await Promise.all([
    getLiveProducts(),
    getApprovedTestimonials(),
  ]);
  const d = getDictionary(locale);

  // Product structured data for the fragrances on the page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: d.home.bestsellersTitle,
    itemListElement: products.slice(0, 4).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: locale === "ar" && p.ar ? p.ar : p.name,
        sku: p.sku,
        image: productImage(p),
        aggregateRating: p.reviews
          ? {
              "@type": "AggregateRating",
              ratingValue: p.rating,
              reviewCount: p.reviews,
            }
          : undefined,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "EGP",
          lowPrice: fromPrice(p),
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised from our own data, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <FamilyTiles products={products} />
      <Bestsellers products={products} />
      <StoryBand />
      <NotesGallery />
      <Testimonials items={testimonials} />
      <Newsletter />
    </>
  );
}
