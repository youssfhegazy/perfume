import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProductEditor } from "@/components/admin/product-editor";
import { getOrders, getProducts, getTestimonials } from "@/lib/data";
import { requirePermission } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";
import type { Product } from "@/lib/types";

/** Client-side draft scaffold for a new product — no endpoint behind it. */
function blankProduct(): Product {
  return {
    id: `product-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    ar: "",
    sku: "MO-NEW-050",
    fam: "woody",
    conc: "EDP",
    rating: 0,
    reviews: 0,
    status: "draft",
    badge: null,
    variants: [{ ml: 50, p: 0, stock: 0 }],
    desc: { en: "", ar: "" },
    notes: { top: [], heart: [], base: [] },
    lon: 3,
    sil: 3,
    seasons: [],
    hint: "New fragrance — bottle on dark ground",
    tags: [],
    gallery: [],
  };
}

export default async function ProductEditorPage({
  params,
}: PageProps<"/[locale]/admin/products/[id]">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requirePermission(locale, "catalogue:write");

  const [products, orders, testimonials] = await Promise.all([
    getProducts(),
    getOrders(),
    getTestimonials(),
  ]);
  const d = getDictionary(locale);

  const product =
    id === "new" ? blankProduct() : products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <AdminShell
      active="editor"
      breadcrumb={`${d.admin.groupCatalogue} · ${d.admin.products}`}
      title={product.name || d.admin.editor}
      products={products}
      orders={orders}
      session={session}
      pendingReviews={testimonials.filter((t) => t.status === "pending").length}
    >
      <ProductEditor product={product} />
    </AdminShell>
  );
}
