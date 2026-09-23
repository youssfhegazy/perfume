import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { DiscountsModule } from "@/components/admin/discounts-module";
import {
  getCoupons,
  getOrders,
  getProducts,
  getTestimonials,
} from "@/lib/data";
import { requirePermission } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export default async function Page({
  params,
}: PageProps<"/[locale]/admin/discounts">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requirePermission(locale, "settings:write");

  const [products, orders, testimonials, coupons] = await Promise.all([
    getProducts(),
    getOrders(),
    getTestimonials(),
    getCoupons(),
  ]);
  const d = getDictionary(locale);

  return (
    <AdminShell
      active="discounts"
      breadcrumb={d.admin.groupCatalogue}
      title={d.admin.discounts}
      products={products}
      orders={orders}
      session={session}
      pendingReviews={testimonials.filter((t) => t.status === "pending").length}
    >
      <DiscountsModule coupons={coupons} />
    </AdminShell>
  );
}
