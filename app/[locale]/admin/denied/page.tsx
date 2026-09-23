import { notFound } from "next/navigation";

import { MoLink } from "@/components/brand/button";
import { Overline } from "@/components/brand/primitives";
import { landingFor } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { getDictionary, isLocale } from "@/lib/i18n/dictionary";

export default async function DeniedPage({
  params,
}: PageProps<"/[locale]/admin/denied">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requireSession(locale);
  const d = getDictionary(locale);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--surface)] p-6 text-center">
      <Overline>403</Overline>
      <h1 className="heading-sm text-[26px]">{d.admin.deniedTitle}</h1>
      <p className="max-w-[46ch] text-sm text-[var(--ink-muted)]">
        {d.admin.deniedBody}
      </p>
      <MoLink
        href={`/${locale}${landingFor(session.role)}`}
        size="admin"
        variant="subtle"
      >
        {d.admin.deniedBack}
      </MoLink>
    </div>
  );
}
