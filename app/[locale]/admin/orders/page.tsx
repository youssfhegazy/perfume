import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersModule } from "@/components/admin/orders-module";
import { getOrders, getProducts, getTestimonials, getZones } from "@/lib/data";
import { requirePermission } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export default async function OrdersPage({
  params,
}: PageProps<"/[locale]/admin/orders">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requirePermission(locale, "orders:read");

  const [products, orders, testimonials, zones] = await Promise.all([
    getProducts(),
    getOrders(),
    getTestimonials(),
    getZones(),
  ]);
  const d = getDictionary(locale);

  return (
    <AdminShell
      active="orders"
      breadcrumb={d.admin.groupMain}
      title={d.admin.orders}
      products={products}
      orders={orders}
      session={session}
      pendingReviews={testimonials.filter((t) => t.status === "pending").length}
    >
      <OrdersModule orders={orders} zones={zones} />
    </AdminShell>
  );
}
