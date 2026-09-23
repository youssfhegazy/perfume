import { noteSlug } from "./format";
import type { Product } from "./types";

/* Placeholder photography lives in public/images (see public/images/CREDITS.md
   and scripts/fetch-images.mjs). Uploaded imagery wins when a product has any;
   these paths are the fallback until the real shoot lands.

   Both helpers take either a product or a bare id, because order items and
   cart lines only carry the id. */

const seedImage = (id: string) => `/images/products/${id}.jpg`;
const seedGallery = (id: string) =>
  [0, 1, 2, 3].map((i) => `/images/products/${id}-${i}.jpg`);

export function productImage(product: Product | string) {
  if (typeof product === "string") return seedImage(product);
  return product.gallery[0]?.url ?? seedImage(product.id);
}

export function productGallery(product: Product | string) {
  if (typeof product === "string") return seedGallery(product);
  return product.gallery.length
    ? product.gallery.map((g) => g.url)
    : seedGallery(product.id);
}

export const noteImage = (nameEn: string) =>
  `/images/notes/${noteSlug(nameEn)}.jpg`;

export const HERO_WIDE = "/images/hero/hero-wide.jpg";
export const HERO_PORTRAIT = "/images/hero/hero-portrait.jpg";
export const STORY_IMAGE = "/images/hero/story.jpg";

export const NOTE_GALLERY = [
  { src: "/images/notes/gallery-saffron.jpg", en: "Saffron threads", ar: "خيوط الزعفران", fam: "spicy" as const },
  { src: "/images/notes/gallery-rose.jpg", en: "Taif rose", ar: "ورد الطائف", fam: "floral" as const },
  { src: "/images/notes/gallery-agarwood.jpg", en: "Agarwood", ar: "خشب العود", fam: "woody" as const },
  { src: "/images/notes/gallery-fig.jpg", en: "Fig leaf", ar: "ورق التين", fam: "fresh" as const },
];

export const BG = {
  pearl: "/images/bg/pearl.jpg",
  abyss: "/images/bg/abyss.jpg",
  newsletter: "/images/bg/newsletter.jpg",
  editorial: "/images/bg/editorial.jpg",
  smoke: "/images/bg/smoke.jpg",
};
