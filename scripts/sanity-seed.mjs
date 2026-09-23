/* Push the seed catalogue into Sanity.

   Usage:
     NEXT_PUBLIC_SANITY_PROJECT_ID=... NEXT_PUBLIC_SANITY_DATASET=production \
     SANITY_WRITE_TOKEN=... node scripts/sanity-seed.mjs

   Safe to re-run: documents use deterministic ids and createOrReplace. */

import { createClient } from "@sanity/client";

import seed from "../lib/seed.json" with { type: "json" };

const { products: PRODUCTS, testimonials: TESTIMONIALS, orders: ORDERS, coupons: COUPONS, zones: ZONES } = seed;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN before running.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

const tx = client.transaction();

for (const p of PRODUCTS) {
  tx.createOrReplace({
    _id: `product.${p.id}`,
    _type: "product",
    slug: { _type: "slug", current: p.id },
    name: p.name,
    ar: p.ar,
    sku: p.sku,
    fam: p.fam,
    conc: p.conc,
    rating: p.rating,
    reviews: p.reviews,
    status: p.status,
    badge: p.badge ? { _type: "localeString", ...p.badge } : undefined,
    variants: p.variants.map((v) => ({ _type: "variant", ...v })),
    desc: { _type: "localeText", ...p.desc },
    notes: {
      _type: "notePyramid",
      top: p.notes.top.map(([en, ar]) => ({ _type: "note", en, ar })),
      heart: p.notes.heart.map(([en, ar]) => ({ _type: "note", en, ar })),
      base: p.notes.base.map(([en, ar]) => ({ _type: "note", en, ar })),
    },
    lon: p.lon,
    sil: p.sil,
    seasons: p.seasons,
    hint: p.hint,
  });
}

for (const t of TESTIMONIALS) {
  tx.createOrReplace({
    _id: `testimonial.${t.id}`,
    _type: "testimonial",
    status: t.status,
    stars: t.stars,
    // `product` is a name string in the seed; wire it to a reference once the
    // products above exist.
    product: {
      _type: "reference",
      _ref: `product.${slugForName(t.product)}`,
    },
    author: { _type: "localeString", ...t.author },
    location: { _type: "localeString", ...t.location },
    body: { _type: "localeText", ...t.body },
  });
}

for (const o of ORDERS) {
  tx.createOrReplace({
    _id: `order.${o.id}`,
    _type: "order",
    number: o.id,
    status: o.status,
    placedAt: o.placedAt,
    customer: o.customer,
    address: o.address,
    items: o.items.map((i) => ({ _type: "orderItem", ...i })),
    shipping: o.shipping,
    payment: o.payment,
    giftWrap: o.giftWrap,
    coupon: o.coupon ?? undefined,
    totals: { _type: "orderTotals", ...o.totals },
  });
}

for (const c of COUPONS) {
  tx.createOrReplace({
    _id: `coupon.${c.code.toLowerCase()}`,
    _type: "coupon",
    code: c.code,
    pct: c.pct,
    used: c.used,
    on: c.on,
  });
}

for (const z of ZONES) {
  tx.createOrReplace({
    _id: `zone.${z.id}`,
    _type: "shippingZone",
    governorate: z.id,
    gov: { _type: "localeString", ...z.gov },
    fee: z.fee,
    eta: { _type: "localeString", ...z.eta },
    cod: z.cod,
  });
}

function slugForName(name) {
  const hit = PRODUCTS.find((p) => p.name === name);
  return hit ? hit.id : "unknown";
}

await tx.commit();
console.log(
  `Seeded ${PRODUCTS.length} products, ${TESTIMONIALS.length} testimonials, ` +
    `${ORDERS.length} orders, ${COUPONS.length} coupons, ${ZONES.length} zones ` +
    `into ${projectId}/${dataset}.`,
);
