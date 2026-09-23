"use client";

import { useActionState } from "react";

import { MoButton } from "@/components/brand/button";
import { AdminField, adminInput } from "@/components/admin/ui";
import { Overline } from "@/components/brand/primitives";
import { useLocale } from "@/components/providers/locale-provider";
import { signIn, type SignInState } from "@/lib/auth/actions";

export function LoginForm({ next }: { next?: string }) {
  const { dict, locale } = useLocale();
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    {},
  );

  const message =
    state.error === "invalid"
      ? dict.admin.signInInvalid
      : state.error === "missing"
        ? dict.admin.signInMissing
        : null;

  return (
    <form
      action={formAction}
      className="w-full max-w-[380px] rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface-raised)] p-8 shadow-[var(--shadow-soft)]"
    >
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <span className="mb-5 grid size-9 place-items-center rounded-[var(--r-sm)] bg-[var(--deep)] text-[15px] text-[var(--on-deep)] [font-family:var(--font-display-family)]">
        M
      </span>

      <Overline className="mb-2">{dict.brand}</Overline>
      <h1 className="heading-sm mb-1 text-[26px]">{dict.admin.signInTitle}</h1>
      <p className="mb-6 text-sm text-[var(--ink-muted)]">
        {dict.admin.signInIntro}
      </p>

      <div className="flex flex-col gap-4">
        <AdminField label={dict.admin.email}>
          <input
            name="email"
            type="email"
            dir="ltr"
            autoComplete="username"
            required
            className={adminInput(Boolean(message))}
          />
        </AdminField>

        <AdminField label={dict.admin.password}>
          <input
            name="password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            required
            className={adminInput(Boolean(message))}
          />
        </AdminField>

        {message ? (
          <p
            role="alert"
            className="rounded-[var(--r-md)] bg-[var(--danger-soft)] px-3 py-2 text-[13px] text-[var(--danger)]"
          >
            {message}
          </p>
        ) : null}

        <MoButton size="admin" type="submit" block loading={pending}>
          {dict.admin.signIn}
        </MoButton>
      </div>
    </form>
  );
}
