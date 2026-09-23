/* Roles, per the handoff's Team & roles module.

   This module is import-safe from anywhere (proxy, server, client) — it holds
   no secrets and touches no Node APIs. */

export const ROLES = ["owner", "admin", "editor", "fulfilment"] as const;
export type Role = (typeof ROLES)[number];

/** What a signed-in user is allowed to do. */
export type Permission =
  | "catalogue:read"
  | "catalogue:write"
  | "orders:read"
  | "orders:write"
  | "content:write"
  | "settings:write"
  | "team:write";

const MATRIX: Record<Role, Permission[]> = {
  owner: [
    "catalogue:read",
    "catalogue:write",
    "orders:read",
    "orders:write",
    "content:write",
    "settings:write",
    "team:write",
  ],
  admin: [
    "catalogue:read",
    "catalogue:write",
    "orders:read",
    "orders:write",
    "content:write",
    "settings:write",
  ],
  // Content only: products and testimonials, no orders and no settings.
  editor: ["catalogue:read", "catalogue:write", "content:write"],
  // Fulfilment only: sees the catalogue to read an order's items, nothing more.
  fulfilment: ["catalogue:read", "orders:read", "orders:write"],
};

export function can(role: Role, permission: Permission) {
  return MATRIX[role]?.includes(permission) ?? false;
}

/** The dashboard modules a role may open, keyed by the nav key. */
export const MODULE_PERMISSION = {
  overview: "orders:read",
  orders: "orders:read",
  products: "catalogue:read",
  editor: "catalogue:write",
  discounts: "settings:write",
  reviews: "content:write",
  shipping: "settings:write",
} as const satisfies Record<string, Permission>;

/** Where to send a role that cannot open the dashboard's landing page. */
export function landingFor(role: Role) {
  if (can(role, "orders:read")) return "/admin";
  if (can(role, "catalogue:read")) return "/admin/products";
  return "/admin/reviews";
}
