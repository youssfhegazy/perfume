"use client";

import { useActionState, useRef } from "react";

import { MoButton } from "@/components/brand/button";
import { AdminField, adminInput } from "@/components/admin/ui";
import { Overline } from "@/components/brand/primitives";
import { useLocale } from "@/components/providers/locale-provider";
import { signIn, type SignInState } from "@/lib/auth/actions";
import type { DemoAccount } from "@/lib/auth/demo";

export function LoginForm({
  next,
  demoAccounts = [],
}: {
  next?: string;
  /** Only passed when demo mode is on. Credentials are throwaway by design. */
  demoAccounts?: DemoAccount[];
}) {
  const { dict, locale } = useLocale();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    {},
  );

  const roleLabels = {
    owner: { name: dict.footer.demoOwner, scope: dict.footer.demoOwnerScope },
    editor: { name: dict.footer.demoEditor, scope: dict.footer.demoEditorScope },
    fulfilment: {
      name: dict.footer.demoFulfilment,
      scope: dict.footer.demoFulfilmentScope,
    },
  } as const;

  function fill(account: DemoAccount) {
    // Set through the native setter so React sees the change.
    const set = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    for (const [el, value] of [
      [emailRef.current, account.email],
      [passwordRef.current, account.password],
    ] as const) {
      if (!el || !set) continue;
      set.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    emailRef.current?.form?.requestSubmit();
  }

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
            ref={emailRef}
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
            ref={passwordRef}
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

      {demoAccounts.length ? (
        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <p className="text-[13px] font-semibold">
            {dict.footer.demoAccountsTitle}
          </p>
          <p className="mb-3 text-[12px] text-[var(--ink-muted)]">
            {dict.footer.demoAccountsNote}
          </p>
          <ul className="flex flex-col gap-2">
            {demoAccounts.map((account) => (
              <li key={account.role}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => fill(account)}
                  className="flex w-full min-h-10 items-center gap-3 rounded-[var(--r-md)] border border-[var(--line-strong)] px-3 text-start transition-colors hover:bg-[var(--aqua-soft)] disabled:opacity-45"
                >
                  <span className="flex-1 leading-tight">
                    <span className="block text-[13px] font-semibold">
                      {roleLabels[account.role].name}
                    </span>
                    <span className="block text-[11px] text-[var(--ink-muted)]">
                      {roleLabels[account.role].scope}
                    </span>
                  </span>
                  <span
                    dir="ltr"
                    className="truncate text-[11px] text-[var(--ink-muted)]"
                  >
                    {account.email}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
