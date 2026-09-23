import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  PencilRuler,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react";

import { can, MODULE_PERMISSION, type Role } from "@/lib/auth/roles";
import type { Dictionary } from "@/lib/i18n/dictionary";

export type NavKey =
  | "overview"
  | "orders"
  | "products"
  | "editor"
  | "discounts"
  | "reviews"
  | "shipping";

export interface NavItem {
  key: NavKey;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export function navGroups(
  d: Dictionary,
  badges: { orders: number; reviews: number },
  /** Omit to get every module — used by the command palette's index. */
  role?: Role,
): NavGroup[] {
  const groups: NavGroup[] = [
    {
      title: d.admin.groupMain,
      items: [
        { key: "overview", label: d.admin.overview, path: "/admin", icon: LayoutDashboard },
        {
          key: "orders",
          label: d.admin.orders,
          path: "/admin/orders",
          icon: ShoppingCart,
          badge: badges.orders || undefined,
        },
      ],
    },
    {
      title: d.admin.groupCatalogue,
      items: [
        { key: "products", label: d.admin.products, path: "/admin/products", icon: Package },
        { key: "editor", label: d.admin.editor, path: "/admin/products/new", icon: PencilRuler },
        { key: "discounts", label: d.admin.discounts, path: "/admin/discounts", icon: Tag },
      ],
    },
    {
      title: d.admin.groupContent,
      items: [
        {
          key: "reviews",
          label: d.admin.reviews,
          path: "/admin/reviews",
          icon: MessageSquareQuote,
          badge: badges.reviews || undefined,
        },
      ],
    },
    {
      title: d.admin.groupConfig,
      items: [
        { key: "shipping", label: d.admin.shipping, path: "/admin/shipping", icon: Truck },
      ],
    },
  ];

  if (!role) return groups;

  // A role only sees the modules it can actually open.
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => can(role, MODULE_PERMISSION[i.key])),
    }))
    .filter((g) => g.items.length > 0);
}

/** The contextual primary action shows only on these three modules. */
export const SHOWS_NEW_PRODUCT: NavKey[] = ["overview", "products", "editor"];
