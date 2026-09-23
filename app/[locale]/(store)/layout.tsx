import { notFound } from "next/navigation";

import { AnnouncementBar } from "@/components/store/announcement-bar";
import { BagDrawer } from "@/components/store/bag-drawer";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { CartProvider } from "@/components/providers/cart-provider";
import { getLiveProducts } from "@/lib/data";
import { isLocale } from "@/lib/i18n/dictionary";

export default async function StoreLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Live products only: draft and archived never render on the storefront.
  // Passed into the cart so bag lines resolve price and stock without a refetch.
  const products = await getLiveProducts();

  return (
    <CartProvider products={products}>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BagDrawer />
    </CartProvider>
  );
}
