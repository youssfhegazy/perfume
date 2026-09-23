"use client";

import Link from "next/link";

import { Overline } from "@/components/brand/primitives";
import { useLocale } from "@/components/providers/locale-provider";
import { DemoBar } from "@/components/store/demo-bar";
import { isDemoMode } from "@/lib/auth/demo";

export function Footer() {
  const { dict, href } = useLocale();

  const groups = [
    {
      title: dict.footer.shop,
      links: [
        { label: dict.footer.allProducts, path: "/collection" },
        { label: dict.footer.discovery, path: "/collection" },
        { label: dict.footer.gifts, path: "/collection" },
      ],
    },
    {
      title: dict.footer.help,
      links: [
        { label: dict.track.title, path: "/track" },
        { label: dict.footer.contact, path: "/collection" },
        { label: dict.footer.shippingReturns, path: "/collection" },
        { label: dict.footer.faq, path: "/collection" },
      ],
    },
    {
      title: dict.footer.house,
      links: [
        { label: dict.footer.about, path: "/collection" },
        { label: dict.footer.journal, path: "/collection" },
        { label: dict.footer.stores, path: "/collection" },
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-[var(--deep)] text-[var(--on-deep)]">
      <div className="shell page-x py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="flex flex-col gap-4">
            <span className="wordmark text-[18px]">{dict.brand}</span>
            <p className="max-w-[40ch] text-sm leading-relaxed text-[var(--on-deep)]/80">
              {dict.footer.blurb}
            </p>
          </div>

          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title} className="flex flex-col gap-4">
              <Overline tone="deep" className="text-[var(--aqua)]">
                {g.title}
              </Overline>
              <ul className="flex flex-col gap-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={href(l.path)}
                      className="text-sm text-[var(--on-deep)]/85 transition-colors hover:text-[var(--on-deep)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Only when NEXT_PUBLIC_DEMO_MODE is on. The action re-checks it. */}
        {isDemoMode() ? (
          <div className="mt-12">
            <DemoBar />
          </div>
        ) : null}

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.14] pt-6 text-[12px] text-[var(--on-deep)]/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {dict.brand}. {dict.footer.rights}
          </p>
          <span className="flex flex-wrap items-center gap-4">
            <Link
              href={href("/admin/login")}
              className="underline decoration-[var(--aqua)] underline-offset-4 transition-colors hover:text-[var(--on-deep)]"
            >
              {dict.footer.dashboard}
            </Link>
            <span>{dict.footer.payments}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
