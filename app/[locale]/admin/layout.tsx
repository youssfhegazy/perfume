import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/* The dashboard is open in this build. Auth and admin roles are listed under
   "Not in this design — still to be decided"; when they land, the guard goes in
   proxy.ts and the role check here. */

export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return children;
}
