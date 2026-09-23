import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { OrderDetail } from "@/components/admin/order-detail";
import { getOrders, getProducts, getTestimonials, getZones } from "@/lib/data";
import { requirePermission } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export default async function OrderDetailPage({
  params,
}: PageProps<"/[locale]/admin/orders/[id]">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requirePermission(locale, "orders:read");

  const [products, orders, testimonials, zones] = await Promise.all([
    getProducts(),
    getOrders(),
    getTestimonials(),
    getZones(),
  ]);
  const order = orders.find((o) => o.id === id);
  if (!order) notFound();

  const d = getDictionary(locale);

  return (
    <AdminShell
      active="orders"
      breadcrumb={`${d.admin.groupMain} · ${d.admin.orders}`}
      title={order.id}
      products={products}
      orders={orders}
      session={session}
      pendingReviews={testimonials.filter((t) => t.status === "pending").length}
    >
      <OrderDetail order={order} products={products} zones={zones} />
    </AdminShell>
  );
}
