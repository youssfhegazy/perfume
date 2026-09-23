"use server";

import { revalidatePath } from "next/cache";

import { writeClient } from "@/sanity/lib/client";
import { sanityWritable } from "@/sanity/lib/env";

import { assertPermission } from "./auth/server";
import { memoryCatalog, resetMemoryCatalog, setMemoryCatalog } from "./store/memory";
import type {
  Coupon,
  GalleryImage,
  Locale,
  OrderStatus,
  Product,
  ShippingZone,
  Subscriber,
  Testimonial,
  TestimonialStatus,
} from "./types";
import { COUPON_RE, isEmail } from "./validation";

/* Dashboard writes. They go to Sanity when a write token is present, and to
   the in-process catalogue otherwise, so the dashboard is exercisable before
   Sanity is provisioned. Validation runs on the server either way — the client
   validates for feedback, not for trust. */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

function bumpStore() {
  // Storefront and dashboard both read the catalogue.
  revalidatePath("/", "layout");
}

/* ------------------------------- products ------------------------------- */

export async function saveProduct(product: Product): Promise<ActionResult<Product>> {
  await assertPermission("catalogue:write");
  const errors: Record<string, string> = {};
  if (!product.name.trim()) errors["name"] = "required";
  if (product.desc.en.length > 320) errors["desc.en"] = "too-long";
  if (product.desc.ar.length > 320) errors["desc.ar"] = "too-long";
  if (!product.variants.length) errors["variants"] = "required";
  product.variants.forEach((v, i) => {
    if (!Number.isFinite(v.p) || v.p <= 0) errors[`variants.${i}.p`] = "price";
    if (!Number.isFinite(v.stock) || v.stock < 0)
      errors[`variants.${i}.stock`] = "stock";
  });
  if (Object.keys(errors).length) return { ok: false, errors };

  const client = sanityWritable ? writeClient() : null;
  if (client) {
    await client.createOrReplace({
      _id: `product.${product.id}`,
      _type: "product",
      slug: { _type: "slug", current: product.id },
      name: product.name,
      ar: product.ar,
      sku: product.sku,
      fam: product.fam,
      conc: product.conc,
      status: product.status,
      badge: product.badge ?? undefined,
      variants: product.variants.map((v) => ({ _type: "variant", ...v })),
      desc: { _type: "localeText", ...product.desc },
      notes: {
        _type: "notePyramid",
        top: product.notes.top.map((n) => ({ _type: "note", ...n })),
        heart: product.notes.heart.map((n) => ({ _type: "note", ...n })),
        base: product.notes.base.map((n) => ({ _type: "note", ...n })),
      },
      lon: product.lon,
      sil: product.sil,
      seasons: product.seasons,
      hint: product.hint,
      tags: product.tags,
      rating: product.rating,
      reviews: product.reviews,
    });
  } else {
    const cat = memoryCatalog();
    const i = cat.products.findIndex((p) => p.id === product.id);
    const products =
      i >= 0
        ? cat.products.map((p) => (p.id === product.id ? product : p))
        : [product, ...cat.products];
    setMemoryCatalog({ ...cat, products });
  }

  bumpStore();
  return { ok: true, data: product };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await assertPermission("catalogue:write");
  const client = sanityWritable ? writeClient() : null;
  if (client) {
    await client.delete({ query: `*[_type == "product" && slug.current == $id]`, params: { id } });
  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      products: cat.products.filter((p) => p.id !== id),
    });
  }
  bumpStore();
  return { ok: true, data: undefined };
}

export async function setProductStatus(
  ids: string[],
  status: Product["status"],
): Promise<ActionResult> {
  const client = sanityWritable ? writeClient() : null;
  if (client) {
    let tx = client.transaction();
    for (const id of ids) tx = tx.patch(`product.${id}`, { set: { status } });  await assertPermission("catalogue:write");

    await tx.commit();
  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      products: cat.products.map((p) =>
        ids.includes(p.id) ? { ...p, status } : p,
      ),
    });
  }
  bumpStore();
  return { ok: true, data: undefined };
}

export async function resetCatalog(): Promise<ActionResult> {
  await assertPermission("catalogue:write");
  if (sanityWritable) {
    return { ok: false, errors: { _: "seed-reset-disabled-with-sanity" } };
  }
  resetMemoryCatalog();
  bumpStore();
  return { ok: true, data: undefined };
}

/* ----------------------------- testimonials ----------------------------- */

export async function saveTestimonial(
  testimonial: Testimonial,
): Promise<ActionResult<Testimonial>> {
  await assertPermission("content:write");
  const errors: Record<string, string> = {};
  if (!testimonial.author.en.trim()) errors["author"] = "required";
  if (testimonial.body.en.trim().length < 10) errors["body"] = "required";
  if (Object.keys(errors).length) return { ok: false, errors };

  const client = sanityWritable ? writeClient() : null;
  if (client) {
    await client.createOrReplace({
      _id: testimonial.id,
      _type: "testimonial",
      status: testimonial.status,
      stars: testimonial.stars,
      author: { _type: "localeString", ...testimonial.author },
      location: { _type: "localeString", ...testimonial.location },
      body: { _type: "localeText", ...testimonial.body },
      reply: testimonial.reply
        ? { _type: "localeText", ...testimonial.reply }
        : undefined,
    });
  } else {
    const cat = memoryCatalog();
    const i = cat.testimonials.findIndex((t) => t.id === testimonial.id);
    const testimonials =
      i >= 0
        ? cat.testimonials.map((t) => (t.id === testimonial.id ? testimonial : t))
        : [testimonial, ...cat.testimonials];
    setMemoryCatalog({ ...cat, testimonials });
  }
  bumpStore();
  return { ok: true, data: testimonial };
}

export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<ActionResult> {
  const client = sanityWritable ? writeClient() : null;
  if (client) {
    await client.patch(id).set({ status }).commit();  await assertPermission("content:write");

  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      testimonials: cat.testimonials.map((t) =>
        t.id === id ? { ...t, status } : t,
      ),
    });
  }
  bumpStore();
  return { ok: true, data: undefined };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  await assertPermission("content:write");
  const client = sanityWritable ? writeClient() : null;
  if (client) await client.delete(id);
  else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      testimonials: cat.testimonials.filter((t) => t.id !== id),
    });
  }
  bumpStore();
  return { ok: true, data: undefined };
}

/* -------------------------------- orders -------------------------------- */

const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
  new: "packed",
  packed: "shipped",
  shipped: "delivered",
  delivered: "new",
  cancelled: "new",
};

export async function advanceOrder(id: string): Promise<ActionResult<OrderStatus>> {
  await assertPermission("orders:write");
  const cat = memoryCatalog();
  const client = sanityWritable ? writeClient() : null;

  let current: OrderStatus | undefined;
  if (client) {
    const doc = await client.fetch<{ status: OrderStatus } | null>(
      `*[_type == "order" && number == $id][0]{status}`,
      { id },
    );
    current = doc?.status;
  } else {
    current = cat.orders.find((o) => o.id === id)?.status;
  }
  if (!current) return { ok: false, errors: { _: "not-found" } };

  const status = NEXT_STATUS[current];

  if (client) {
    await client
      .patch({ query: `*[_type == "order" && number == $id]`, params: { id } })
      .set({ status })
      .commit();
  } else {
    setMemoryCatalog({
      ...cat,
      orders: cat.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    });
  }
  bumpStore();
  return { ok: true, data: status };
}

/* ------------------------------- coupons -------------------------------- */

export async function createCoupon(
  code: string,
  pct: number,
): Promise<ActionResult<Coupon>> {
  await assertPermission("settings:write");
  const errors: Record<string, string> = {};
  const normalised = code.trim().toUpperCase();
  if (!COUPON_RE.test(normalised)) errors["code"] = "format";
  if (!Number.isFinite(pct) || pct < 1 || pct > 90) errors["pct"] = "range";

  const cat = memoryCatalog();
  const client = sanityWritable ? writeClient() : null;

  const existing = client
    ? await client.fetch<number>(`count(*[_type == "coupon" && code == $c])`, {
        c: normalised,
      })
    : cat.coupons.filter((c) => c.code === normalised).length;
  if (existing > 0) errors["code"] = "duplicate";

  if (Object.keys(errors).length) return { ok: false, errors };

  const coupon: Coupon = {
    id: `coupon-${normalised.toLowerCase()}`,
    code: normalised,
    pct: Math.round(pct),
    used: 0,
    on: true,
    usageLimit: null,
    minOrder: null,
    startsAt: null,
    endsAt: null,
  };

  if (client) {
    await client.create({
      _type: "coupon",
      code: coupon.code,
      pct: coupon.pct,
      used: 0,
      on: true,
    });
  } else {
    setMemoryCatalog({ ...cat, coupons: [coupon, ...cat.coupons] });
  }
  bumpStore();
  return { ok: true, data: coupon };
}

export async function toggleCoupon(id: string): Promise<ActionResult> {
  await assertPermission("settings:write");
  const client = sanityWritable ? writeClient() : null;
  if (client) {
    const doc = await client.fetch<{ on: boolean } | null>(
      `*[_id == $id][0]{on}`,
      { id },
    );
    await client.patch(id).set({ on: !(doc?.on ?? true) }).commit();
  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      coupons: cat.coupons.map((c) => (c.id === id ? { ...c, on: !c.on } : c)),
    });
  }
  bumpStore();
  return { ok: true, data: undefined };
}

/* ----------------------------- shipping zones ---------------------------- */

export async function saveZones(zones: ShippingZone[]): Promise<ActionResult> {
  await assertPermission("settings:write");
  const errors: Record<string, string> = {};
  zones.forEach((z) => {
    if (!Number.isFinite(z.fee) || z.fee < 0) errors[z.id] = "fee";
  });
  if (Object.keys(errors).length) return { ok: false, errors };

  const client = sanityWritable ? writeClient() : null;
  if (client) {
    let tx = client.transaction();
    for (const z of zones) {
      tx = tx.createOrReplace({
        _id: `zone.${z.id}`,
        _type: "shippingZone",
        governorate: z.id,
        gov: { _type: "localeString", ...z.gov },
        fee: z.fee,
        eta: { _type: "localeString", ...z.eta },
        cod: z.cod,
      });
    }
    await tx.commit();
  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({ ...cat, zones });
  }
  bumpStore();
  return { ok: true, data: undefined };
}

/* ------------------------------- tagging -------------------------------- */

export async function addTagToProducts(
  ids: string[],
  tag: string,
): Promise<ActionResult<string>> {
  const clean = tag.trim();  await assertPermission("catalogue:write");

  if (!clean) return { ok: false, errors: { tag: "required" } };
  if (!ids.length) return { ok: false, errors: { _: "no-selection" } };

  const client = sanityWritable ? writeClient() : null;
  if (client) {
    let tx = client.transaction();
    for (const id of ids) {
      // setIfMissing then append, so the first tag on a product works too.
      tx = tx.patch(`product.${id}`, (p) =>
        p.setIfMissing({ tags: [] }).append("tags", [clean]),
      );
    }
    await tx.commit();
  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      products: cat.products.map((p) =>
        ids.includes(p.id) && !p.tags.includes(clean)
          ? { ...p, tags: [...p.tags, clean] }
          : p,
      ),
    });
  }
  bumpStore();
  return { ok: true, data: clean };
}

/* ------------------------------ media upload ----------------------------- */

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Adds an image to a product's gallery.
 *
 * With Sanity configured the file goes to its asset pipeline. Without it the
 * file is written under `public/images/uploads` — which works in development
 * (the seed-mode use case) but not on a read-only or serverless filesystem.
 */
export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<ActionResult<GalleryImage>> {
  await assertPermission("catalogue:write");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errors: { file: "required" } };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, errors: { file: "type" } };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, errors: { file: "size" } };
  }

  const alt = String(formData.get("alt") ?? "").trim();
  let image: GalleryImage;

  const client = sanityWritable ? writeClient() : null;
  if (client) {
    const asset = await client.assets.upload(
      "image",
      Buffer.from(await file.arrayBuffer()),
      { filename: file.name, contentType: file.type },
    );
    await client
      .patch(`product.${productId}`)
      .setIfMissing({ gallery: [] })
      .append("gallery", [
        {
          _type: "image",
          _key: asset._id.slice(-12),
          asset: { _type: "reference", _ref: asset._id },
          alt: { _type: "localeString", en: alt, ar: alt },
        },
      ])
      .commit();
    image = { url: asset.url, alt: { en: alt, ar: alt } };
  } else {
    const { writeFile, mkdir } = await import("node:fs/promises");
    const path = await import("node:path");

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const name = `${productId}-${Date.now().toString(36)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, name),
      Buffer.from(await file.arrayBuffer()),
    );

    image = { url: `/images/uploads/${name}`, alt: { en: alt, ar: alt } };
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      products: cat.products.map((p) =>
        p.id === productId ? { ...p, gallery: [...p.gallery, image] } : p,
      ),
    });
  }

  bumpStore();
  return { ok: true, data: image };
}

export async function removeProductImage(
  productId: string,
  url: string,
): Promise<ActionResult> {
  await assertPermission("catalogue:write");
  const client = sanityWritable ? writeClient() : null;
  if (client) {
    const keys = await client.fetch<string[]>(
      `*[_type == "product" && slug.current == $id][0].gallery[asset->url == $url]._key`,
      { id: productId, url },
    );
    if (keys?.length) {
      await client
        .patch(`product.${productId}`)
        .unset(keys.map((k) => `gallery[_key=="${k}"]`))
        .commit();
    }
  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      products: cat.products.map((p) =>
        p.id === productId
          ? { ...p, gallery: p.gallery.filter((g) => g.url !== url) }
          : p,
      ),
    });
  }
  bumpStore();
  return { ok: true, data: undefined };
}

/* ------------------------------ review reply ----------------------------- */

export async function replyToTestimonial(
  id: string,
  reply: string,
): Promise<ActionResult<string | null>> {
  const clean = reply.trim();  await assertPermission("content:write");

  const value = clean ? { en: clean, ar: clean } : null;

  const client = sanityWritable ? writeClient() : null;
  if (client) {
    const patch = client.patch(id);
    await (value
      ? patch.set({ reply: { _type: "localeText", ...value } })
      : patch.unset(["reply"])
    ).commit();
  } else {
    const cat = memoryCatalog();
    setMemoryCatalog({
      ...cat,
      testimonials: cat.testimonials.map((t) =>
        t.id === id ? { ...t, reply: value } : t,
      ),
    });
  }
  bumpStore();
  return { ok: true, data: clean || null };
}

/* ------------------------------- newsletter ------------------------------ */

export async function subscribeToNewsletter(
  email: string,
  locale: Locale,
): Promise<ActionResult<Subscriber>> {
  const clean = email.trim().toLowerCase();
  if (!isEmail(clean)) return { ok: false, errors: { email: "invalid" } };

  const client = sanityWritable ? writeClient() : null;

  // Subscribing twice is not an error — it is the same outcome.
  const existing = client
    ? await client.fetch<number>(
        `count(*[_type == "subscriber" && email == $e])`,
        { e: clean },
      )
    : memoryCatalog().subscribers.filter((s) => s.email === clean).length;

  const subscriber: Subscriber = {
    id: `subscriber.${clean.replace(/[^a-z0-9]/g, "-")}`,
    email: clean,
    locale,
    createdAt: new Date().toISOString(),
  };

  if (existing === 0) {
    if (client) {
      await client.create({
        _type: "subscriber",
        email: subscriber.email,
        locale: subscriber.locale,
        createdAt: subscriber.createdAt,
      });
    } else {
      const cat = memoryCatalog();
      setMemoryCatalog({
        ...cat,
        subscribers: [subscriber, ...cat.subscribers],
      });
    }
    bumpStore();
  }

  return { ok: true, data: subscriber };
}
