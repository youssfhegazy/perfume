import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewsModule } from "@/components/admin/reviews-module";
import { getOrders, getProducts, getTestimonials } from "@/lib/data";
import { requirePermission } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export default async function Page({
  params,
}: PageProps<"/[locale]/admin/reviews">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requirePermission(locale, "content:write");

  const [products, orders, testimonials] = await Promise.all([
    getProducts(),
    getOrders(),
    getTestimonials(),
  ]);
  const d = getDictionary(locale);

  return (
    <AdminShell
      active="reviews"
      breadcrumb={d.admin.groupContent}
      title={d.admin.reviews}
      products={products}
      orders={orders}
      session={session}
      pendingReviews={testimonials.filter((t) => t.status === "pending").length}
    >
      <ReviewsModule testimonials={testimonials} products={products} />
    </AdminShell>
  );
}
