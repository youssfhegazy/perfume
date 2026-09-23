import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { Overview } from "@/components/admin/overview";
import { getOrders, getProducts, getTestimonials } from "@/lib/data";
import { requirePermission } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export default async function OverviewPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requirePermission(locale, "orders:read");

  const [products, orders, testimonials] = await Promise.all([
    getProducts(),
    getOrders(),
    getTestimonials(),
  ]);
  const d = getDictionary(locale);

  return (
    <AdminShell
      active="overview"
      breadcrumb={d.admin.groupMain}
      title={d.admin.overview}
      products={products}
      orders={orders}
      session={session}
      pendingReviews={testimonials.filter((t) => t.status === "pending").length}
    >
      <Overview products={products} orders={orders} />
    </AdminShell>
  );
}
