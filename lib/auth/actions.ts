"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { landingFor } from "./roles";
import { authSecret, getSession, verifyCredentials } from "./server";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "./session";

export interface SignInState {
  error?: "invalid" | "missing";
}

/**
 * Credentials sign-in, driven by `useActionState`.
 *
 * The failure message never distinguishes an unknown address from a wrong
 * password, and `verifyCredentials` hashes either way so the timing does not
 * either.
 */
export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const next = String(formData.get("next") ?? "");

  if (!email.trim() || !password) return { error: "missing" };

  const user = await verifyCredentials(email, password);
  if (!user) return { error: "invalid" };

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(user, authSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Only ever redirect within this site.
  const target =
    next.startsWith("/") && !next.startsWith("//")
      ? next
      : `/${locale}${landingFor(user.role)}`;
  redirect(target);
}

export async function signOut(locale: string) {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect(`/${locale}/admin/login`);
}

/** Exposed to Server Components that need the current user. */
export async function currentUser() {
  return getSession();
}
