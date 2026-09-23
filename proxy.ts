import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/dictionary";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/* Locale routing and the dashboard guard.

   Arabic is the default for Egyptian traffic, so a request with an Arabic
   Accept-Language lands on /ar.

   The guard here is the outer gate — it keeps anonymous traffic off /admin and
   /studio entirely. Per-module permissions are still checked on the server in
   each page and action, because a cookie only proves who you are, not what you
   may do. */

function pickLocale(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase());
  for (const tag of preferred) {
    if (tag.startsWith("ar")) return "ar";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}

const PROTECTED = /^\/(?:[a-z]{2}\/)?(admin|studio)(?:\/|$)/;
const PUBLIC_ADMIN = /^\/[a-z]{2}\/admin\/login\/?$/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (!hasLocale) {
    // /studio renders its own shell and is not localised.
    if (pathname === "/studio" || pathname.startsWith("/studio/")) {
      return guard(request, pathname, DEFAULT_LOCALE);
    }
    const locale = pickLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  return guard(request, pathname, pathname.slice(1, 3));
}

async function guard(
  request: NextRequest,
  pathname: string,
  locale: string,
) {
  if (!PROTECTED.test(pathname) || PUBLIC_ADMIN.test(pathname)) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Fail closed: an unconfigured secret must not leave the dashboard open.
    console.error("[auth] AUTH_SECRET is not set — refusing dashboard access.");
    return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
  }

  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
    secret,
  );
  if (session) return NextResponse.next();

  const url = new URL(`/${locale}/admin/login`, request.url);
  url.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|images|api|favicon.ico|.*\\..*).*)"],
};
