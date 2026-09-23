import type { Role } from "./roles";

/* Demo mode.
 *
 * Two entry points from the storefront footer:
 *
 *   1. "Enter as demo" — one click into the dashboard, no credentials typed.
 *   2. "Sign in"       — the real login page, which offers the three demo
 *                        accounts as quick-fill when demo mode is on.
 *
 * The accounts live in .env.local, not in code, so they can be changed without
 * a deploy. Demo mode is off unless NEXT_PUBLIC_DEMO_MODE is "1" or "true",
 * and every server action re-checks that flag — a client-side flag is a
 * rendering hint, never a guard.
 *
 * Never enable this on a production storefront.
 */

export const DEMO_ROLES = ["owner", "editor", "fulfilment"] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

export interface DemoAccount {
  role: DemoRole;
  email: string;
  password: string;
}

export function isDemoMode() {
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE;
  return flag === "1" || flag === "true";
}

export function isDemoRole(value: string): value is DemoRole {
  return (DEMO_ROLES as readonly string[]).includes(value);
}

const ENV_KEYS: Record<DemoRole, { email: string; password: string }> = {
  owner: { email: "DEMO_OWNER_EMAIL", password: "DEMO_OWNER_PASSWORD" },
  editor: { email: "DEMO_EDITOR_EMAIL", password: "DEMO_EDITOR_PASSWORD" },
  fulfilment: {
    email: "DEMO_FULFILMENT_EMAIL",
    password: "DEMO_FULFILMENT_PASSWORD",
  },
};

/**
 * The demo accounts, read from the environment. Server-only: the passwords
 * are real credentials, even if they are throwaway ones.
 *
 * Returns only the roles that are fully configured, so a half-filled .env
 * degrades to fewer buttons rather than broken ones.
 */
export function demoAccounts(): DemoAccount[] {
  if (!isDemoMode()) return [];
  return DEMO_ROLES.flatMap((role) => {
    const email = process.env[ENV_KEYS[role].email]?.trim();
    const password = process.env[ENV_KEYS[role].password]?.trim();
    if (!email || !password) return [];
    return [{ role, email: email.toLowerCase(), password }];
  });
}

/** The account the one-click "enter as demo" button uses. */
export function demoEntryAccount(): DemoAccount | null {
  const accounts = demoAccounts();
  return accounts.find((a) => a.role === "owner") ?? accounts[0] ?? null;
}

export function isDemoEmail(email: string) {
  const clean = email.trim().toLowerCase();
  return demoAccounts().some((a) => a.email === clean);
}

/** Maps a demo role onto a dashboard role. They are the same set today. */
export const DEMO_SCOPE: Record<DemoRole, Role> = {
  owner: "owner",
  editor: "editor",
  fulfilment: "fulfilment",
};
