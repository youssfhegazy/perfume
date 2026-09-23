import { defineQuery } from "next-sanity";

/* Projections shape Sanity documents into the app's domain types (lib/types),
   so nothing downstream has to know where the data came from. */

const PRODUCT_FIELDS = /* groq */ `
  "id": slug.current,
  name,
  "ar": coalesce(ar, ""),
  sku,
  fam,
  conc,
  "rating": coalesce(rating, 0),
  "reviews": coalesce(reviews, 0),
  status,
  "badge": select(defined(badge.en) => { "en": badge.en, "ar": coalesce(badge.ar, badge.en) }, null),
  "variants": coalesce(variants[]{ ml, p, "stock": coalesce(stock, 0) }, []),
  "desc": { "en": coalesce(desc.en, ""), "ar": coalesce(desc.ar, "") },
  "notes": {
    "top": coalesce(notes.top[]{ en, "ar": coalesce(ar, en) }, []),
    "heart": coalesce(notes.heart[]{ en, "ar": coalesce(ar, en) }, []),
    "base": coalesce(notes.base[]{ en, "ar": coalesce(ar, en) }, [])
  },
  "lon": coalesce(lon, 3),
  "sil": coalesce(sil, 3),
  "seasons": coalesce(seasons, []),
  "hint": coalesce(hint, ""),
  "tags": coalesce(tags, []),
  "gallery": coalesce(gallery[]{ "url": asset->url, "alt": alt }, [])
`;

export const allProductsQuery = defineQuery(/* groq */ `
  *[_type == "product"] | order(name asc) { ${PRODUCT_FIELDS} }
`);

export const liveProductsQuery = defineQuery(/* groq */ `
  *[_type == "product" && status == "live"] | order(name asc) { ${PRODUCT_FIELDS} }
`);

export const productBySlugQuery = defineQuery(/* groq */ `
  *[_type == "product" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }
`);

export const allTestimonialsQuery = defineQuery(/* groq */ `
  *[_type == "testimonial"] | order(_createdAt desc) {
    "id": _id,
    status,
    stars,
    "product": product->name,
    "author": { "en": coalesce(author.en, ""), "ar": coalesce(author.ar, author.en, "") },
    "location": { "en": coalesce(location.en, ""), "ar": coalesce(location.ar, location.en, "") },
    "body": { "en": coalesce(body.en, ""), "ar": coalesce(body.ar, body.en, "") },
    "reply": select(defined(reply.en) => { "en": reply.en, "ar": coalesce(reply.ar, reply.en) }, null)
  }
`);

export const approvedTestimonialsQuery = defineQuery(/* groq */ `
  *[_type == "testimonial" && status == "approved"] | order(_createdAt desc) [0...3] {
    "id": _id,
    status,
    stars,
    "product": product->name,
    "author": { "en": coalesce(author.en, ""), "ar": coalesce(author.ar, author.en, "") },
    "location": { "en": coalesce(location.en, ""), "ar": coalesce(location.ar, location.en, "") },
    "body": { "en": coalesce(body.en, ""), "ar": coalesce(body.ar, body.en, "") },
    "reply": select(defined(reply.en) => { "en": reply.en, "ar": coalesce(reply.ar, reply.en) }, null)
  }
`);

export const allOrdersQuery = defineQuery(/* groq */ `
  *[_type == "order"] | order(placedAt desc) {
    "id": number,
    status,
    placedAt,
    customer,
    address,
    "items": coalesce(items, []),
    shipping,
    payment,
    "paymentStatus": coalesce(paymentStatus, "due"),
    "giftWrap": coalesce(giftWrap, false),
    coupon,
    totals
  }
`);

export const allCouponsQuery = defineQuery(/* groq */ `
  *[_type == "coupon"] | order(code asc) {
    "id": _id,
    code,
    pct,
    "used": coalesce(used, 0),
    "on": coalesce(on, true),
    "usageLimit": coalesce(usageLimit, null),
    "minOrder": coalesce(minOrder, null),
    "startsAt": coalesce(startsAt, null),
    "endsAt": coalesce(endsAt, null)
  }
`);

export const allZonesQuery = defineQuery(/* groq */ `
  *[_type == "shippingZone"] {
    "id": governorate,
    "gov": { "en": coalesce(gov.en, ""), "ar": coalesce(gov.ar, gov.en, "") },
    fee,
    "eta": { "en": coalesce(eta.en, ""), "ar": coalesce(eta.ar, eta.en, "") },
    "cod": coalesce(cod, false)
  }
`);

export const allSubscribersQuery = defineQuery(/* groq */ `
  *[_type == "subscriber"] | order(createdAt desc) {
    "id": _id, email, "locale": coalesce(locale, "en"), createdAt
  }
`);
