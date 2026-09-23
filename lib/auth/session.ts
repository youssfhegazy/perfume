import { jwtVerify, SignJWT } from "jose";

import type { Role } from "./roles";

/* Signed session cookie.

   Deliberately small: a JWT with the user id, name and role, signed with
   HS256. It is readable by `proxy.ts` (Node runtime in Next 16) and by Server
   Components without a database round trip.

   No secrets live in this module — the key is passed in — so it can be
   imported from the proxy as well as the server. */

export const SESSION_COOKIE = "mo_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export function sessionKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser, secret: string) {
  return new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setIssuer("maison-oud")
    .setAudience("maison-oud:admin")
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(sessionKey(secret));
}

export async function verifySession(
  token: string | undefined,
  secret: string,
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(secret), {
      issuer: "maison-oud",
      audience: "maison-oud:admin",
    });
    if (!payload.sub || typeof payload.role !== "string") return null;
    return {
      id: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role as Role,
    };
  } catch {
    // Expired, tampered with, or signed by a different key.
    return null;
  }
}
