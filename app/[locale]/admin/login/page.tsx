import { notFound, redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth/server";
import { landingFor } from "@/lib/auth/roles";
import { isLocale } from "@/lib/i18n/dictionary";

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/login">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Already signed in — go where this role can actually work.
  const session = await getSession();
  if (session) redirect(`/${locale}${landingFor(session.role)}`);

  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--surface)] p-4">
      <LoginForm next={next} />
    </div>
  );
}
