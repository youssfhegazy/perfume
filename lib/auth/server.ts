import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readClient, writeClient } from "@/sanity/lib/client";
import { sanityConfigured } from "@/sanity/lib/env";

import { isDemoEmail, isDemoMode } from "./demo";
import { verifyPassword } from "./password";
import { can, type Permission, type Role } from "./roles";
import {
  SESSION_COOKIE,
  verifySession,
  type SessionUser,
} from "./session";

/* Server-side session access and the user store.

   When Sanity is configured, users are `user` documents. Otherwise a single
   owner account is read from the environment so the dashboard is reachable in
   seed mode without provisioning anything. */

export function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a random 32+ character value — see .env.example.",
    );
  }
  return secret;
}

/** The signed-in user, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value, authSecret());
}

/** Redirects to the login page when there is no session. */
export async function requireSession(locale: string, from?: string) {
  const session = await getSession();
  if (!session) {
    const next = from ? `?next=${encodeURIComponent(from)}` : "";
    redirect(`/${locale}/admin/login${next}`);
  }
  return session;
}

/** Redirects to login, or to 404 when signed in without the permission. */
export async function requirePermission(
  locale: string,
  permission: Permission,
  from?: string,
) {
  const session = await requireSession(locale, from);
  if (!can(session.role, permission)) redirect(`/${locale}/admin/denied`);
  return session;
}

/** For server actions: throws rather than redirecting. */
export async function assertPermission(permission: Permission) {
  const session = await getSession();
  if (!session) throw new Error("unauthenticated");
  if (!can(session.role, permission)) throw new Error("forbidden");
  return session;
}

/* --------------------------------- users --------------------------------- */

interface StoredUser extends SessionUser {
  passwordHash: string;
}

/** Env-backed owner, for seed mode and first-run bootstrapping. */
function envOwner(): StoredUser | null {
  const email = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || !hash) return null;
  return {
    id: "env-owner",
    name: process.env.ADMIN_NAME ?? "Owner",
    email: email.toLowerCase(),
    role: "owner",
    passwordHash: hash,
  };
}

async function findUser(email: string): Promise<StoredUser | null> {
  const clean = email.trim().toLowerCase();

  const owner = envOwner();
  if (owner && owner.email === clean) return owner;

  if (!sanityConfigured) return null;
  const client = readClient();
  if (!client) return null;

  const doc = await client.fetch<StoredUser | null>(
    `*[_type == "user" && email == $email && active == true][0]{
      "id": _id, name, email, role, passwordHash
    }`,
    { email: clean },
    { cache: "no-store" },
  );
  return doc?.passwordHash ? doc : null;
}

/**
 * Verifies credentials. Always runs a hash comparison, even for an unknown
 * address, so response time does not reveal whether the account exists.
 */
const DUMMY_HASH =
  "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(88);

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await findUser(email);
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/** Creates or updates a dashboard user. Requires `team:write`. */
export async function upsertUser(input: {
  id?: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
}) {
  const client = writeClient();
  if (!client) throw new Error("sanity-not-writable");
  const id = input.id ?? `user.${input.email.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  await client.createOrReplace({
    _id: id,
    _type: "user",
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    passwordHash: input.passwordHash,
    active: true,
  });
  return id;
}

/**
 * Looks up a demo account by address, bypassing the password because the
 * caller has already established that demo mode is on. Refuses any address
 * that is not one of the three demo accounts.
 */
export async function findDemoUser(email: string) {
  if (!isDemoMode()) return null;
  if (!isDemoEmail(email)) return null;

  const user = await findUser(email);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
