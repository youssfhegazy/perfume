import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsModule } from "@/components/admin/products-module";
import { getOrders, getProducts, getTestimonials } from "@/lib/data";
import { requirePermission } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export default async function ProductsPage({
  params,
}: PageProps<"/[locale]/admin/products">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requirePermission(locale, "catalogue:read");

  const [products, orders, testimonials] = await Promise.all([
    getProducts(),
    getOrders(),
    getTestimonials(),
  ]);
  const d = getDictionary(locale);

  return (
    <AdminShell
      active="products"
      breadcrumb={d.admin.groupCatalogue}
      title={d.admin.products}
      products={products}
      orders={orders}
      session={session}
      pendingReviews={testimonials.filter((t) => t.status === "pending").length}
    >
      <ProductsModule products={products} />
    </AdminShell>
  );
}
