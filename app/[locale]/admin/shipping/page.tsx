import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ShippingModule } from "@/components/admin/shipping-module";
import {
  getOrders,
  getProducts,
  getTestimonials,
  getZones,
} from "@/lib/data";
import { requirePermission } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export default async function Page({
  params,
}: PageProps<"/[locale]/admin/shipping">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requirePermission(locale, "settings:write");

  const [products, orders, testimonials, zones] = await Promise.all([
    getProducts(),
    getOrders(),
    getTestimonials(),
    getZones(),
  ]);
  const d = getDictionary(locale);

  return (
    <AdminShell
      active="shipping"
      breadcrumb={d.admin.groupConfig}
      title={d.admin.shipping}
      products={products}
      orders={orders}
      session={session}
      pendingReviews={testimonials.filter((t) => t.status === "pending").length}
    >
      <ShippingModule zones={zones} />
    </AdminShell>
  );
}
