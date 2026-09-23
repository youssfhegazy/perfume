import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutView } from "@/components/store/checkout-view";
import { getCoupons, getZones } from "@/lib/data";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).checkout.title, robots: { index: false } };
}

export default async function CheckoutPage({
  params,
}: PageProps<"/[locale]/checkout">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Shipping is priced from the governorate's zone fee, not a flat rate.
  const [zones, coupons] = await Promise.all([getZones(), getCoupons()]);

  return <CheckoutView zones={zones} coupons={coupons} />;
}
