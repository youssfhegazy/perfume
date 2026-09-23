"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { MoButton } from "@/components/brand/button";
import { EmptyState } from "@/components/brand/primitives";
import { RevealGroup, RevealItem } from "@/components/brand/reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { ProductCard } from "@/components/store/product-card";
import { cn } from "@/lib/utils";
import {
  CONCENTRATIONS,
  count,
  FAMILIES,
  fromPrice,
  isSoldOut,
  money,
} from "@/lib/format";
import { plural } from "@/lib/i18n/dictionary";
import type { Concentration, Family, Product } from "@/lib/types";

type Sort = "featured" | "newest" | "price-asc" | "price-desc";

const PRICE_MIN = 1800;
const PRICE_MAX = 5000;
const PRICE_STEP = 50;

export function CollectionView({ products }: { products: Product[] }) {
  const { dict, locale, href } = useLocale();
  const params = useSearchParams();

  const [families, setFamilies] = useState<Family[]>(() => {
    const f = params.get("family");
    return f && FAMILIES.includes(f as Family) ? [f as Family] : [];
  });
  const [concs, setConcs] = useState<Concentration[]>([]);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [panelOpen, setPanelOpen] = useState(false);

  const familyCounts = useMemo(() => {
    const m = new Map<Family, number>();
    for (const f of FAMILIES) m.set(f, 0);
    for (const p of products) m.set(p.fam, (m.get(p.fam) ?? 0) + 1);
    return m;
  }, [products]);

  const concCounts = useMemo(() => {
    const m = new Map<Concentration, number>();
    for (const c of CONCENTRATIONS) m.set(c, 0);
    for (const p of products) m.set(p.conc, (m.get(p.conc) ?? 0) + 1);
    return m;
  }, [products]);

  const results = useMemo(() => {
    const filtered = products.filter((p) => {
      if (families.length && !families.includes(p.fam)) return false;
      if (concs.length && !concs.includes(p.conc)) return false;
      if (fromPrice(p) > maxPrice) return false;
      if (inStockOnly && isSoldOut(p)) return false;
      return true;
    });

    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => fromPrice(a) - fromPrice(b));
    else if (sort === "price-desc")
      sorted.sort((a, b) => fromPrice(b) - fromPrice(a));
    else if (sort === "newest") sorted.reverse();
    return sorted;
  }, [products, families, concs, maxPrice, inStockOnly, sort]);

  const activeCount =
    families.length + concs.length + (inStockOnly ? 1 : 0) + (maxPrice < PRICE_MAX ? 1 : 0);

  function toggleFamily(f: Family) {
    setFamilies((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }

  function toggleConc(c: Concentration) {
    setConcs((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function clearAll() {
    setFamilies([]);
    setConcs([]);
    setMaxPrice(PRICE_MAX);
    setInStockOnly(false);
  }

  return (
    <div className="shell page-x py-10 lg:py-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-[var(--ink-muted)]">
        <Link href={href("/")} className="hover:text-[var(--ink)]">
          {dict.plp.breadcrumbHome}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-[var(--ink)]">{dict.plp.title}</span>
      </nav>

      <header className="mb-10 flex flex-col gap-4">
        <h1 className="display-lg">{dict.plp.title}</h1>
        <p className="max-w-[56ch] text-base text-[var(--ink-muted)]">
          {dict.plp.intro}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-8">
            <FilterGroup title={dict.plp.family}>
              {FAMILIES.map((f) => (
                <CheckRow
                  key={f}
                  checked={families.includes(f)}
                  onChange={() => toggleFamily(f)}
                  label={dict.families[f]}
                  count={count(familyCounts.get(f) ?? 0, locale)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={dict.plp.concentration}>
              {CONCENTRATIONS.map((c) => (
                <CheckRow
                  key={c}
                  checked={concs.includes(c)}
                  onChange={() => toggleConc(c)}
                  label={c}
                  count={count(concCounts.get(c) ?? 0, locale)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={dict.plp.price}>
              <label className="flex flex-col gap-2">
                <span className="num text-[13px] text-[var(--ink-muted)]">
                  {dict.plp.upTo} {money(maxPrice, locale)}
                </span>
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[var(--primary-c)]"
                  aria-label={dict.plp.price}
                />
              </label>
            </FilterGroup>

            <div className="hairline pt-6">
              <CheckRow
                checked={inStockOnly}
                onChange={() => setInStockOnly((v) => !v)}
                label={dict.plp.inStockOnly}
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              aria-expanded={panelOpen}
              className="inline-flex min-h-9 items-center gap-2 rounded-[var(--r-full)] border border-[var(--line-strong)] px-3 text-[13px] font-medium lg:hidden"
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={1.5} />
              {dict.plp.filters}
              {activeCount ? ` (${count(activeCount, locale)})` : ""}
            </button>

            <p className="num text-[13px] text-[var(--ink-muted)]">
              {count(results.length, locale)}{" "}
              {plural(dict.plp.results, results.length, locale)}
            </p>

            <div className="hidden flex-wrap items-center gap-2 lg:flex">
              {families.map((f) => (
                <Pill key={f} onClear={() => toggleFamily(f)}>
                  {dict.families[f]}
                </Pill>
              ))}
              {concs.map((c) => (
                <Pill key={c} onClear={() => toggleConc(c)}>
                  {c}
                </Pill>
              ))}
              {inStockOnly ? (
                <Pill onClear={() => setInStockOnly(false)}>
                  {dict.plp.inStockOnly}
                </Pill>
              ) : null}
            </div>

            <label className="ms-auto flex items-center gap-2 text-[13px]">
              <span className="text-[var(--ink-muted)]">{dict.plp.sort}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="min-h-9 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-[var(--surface-raised)] px-2 text-[13px]"
              >
                <option value="featured">{dict.plp.sortFeatured}</option>
                <option value="newest">{dict.plp.sortNewest}</option>
                <option value="price-asc">{dict.plp.sortPriceAsc}</option>
                <option value="price-desc">{dict.plp.sortPriceDesc}</option>
              </select>
            </label>
          </div>

          {/* Mobile filter panel */}
          {panelOpen ? (
            <div className="mb-6 flex flex-col gap-4 border border-[var(--line)] bg-[var(--surface-raised)] p-4 lg:hidden">
              <div className="flex flex-wrap gap-2">
                {FAMILIES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFamily(f)}
                    aria-pressed={families.includes(f)}
                    className={cn(
                      "min-h-9 rounded-[var(--r-full)] border px-3 text-[13px]",
                      families.includes(f)
                        ? "border-[var(--primary-c)] bg-[var(--aqua-soft)] text-[var(--aqua-ink)]"
                        : "border-[var(--line-strong)]",
                    )}
                  >
                    {dict.families[f]}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly((v) => !v)}
                  className="size-4 accent-[var(--primary-c)]"
                />
                {dict.plp.inStockOnly}
              </label>
              <MoButton block onClick={() => setPanelOpen(false)}>
                {dict.plp.showResults} ({count(results.length, locale)})
              </MoButton>
            </div>
          ) : null}

          {results.length === 0 ? (
            <EmptyState
              title={dict.plp.emptyTitle}
              body={dict.plp.emptyBody}
              action={
                <MoButton variant="outline" onClick={clearAll}>
                  {dict.plp.clearAll}
                </MoButton>
              }
            />
          ) : (
            <RevealGroup className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-6">
              {results.map((p, i) => (
                <RevealItem key={p.id}>
                  <ProductCard
                    product={p}
                    priority={i < 3}
                    sizes="(min-width:1024px) 30vw, 50vw"
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[13px] font-semibold">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  count: n,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: string;
}) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 accent-[var(--primary-c)]"
      />
      <span className="flex-1">{label}</span>
      {n !== undefined ? (
        <span className="num text-[13px] text-[var(--ink-muted)]">{n}</span>
      ) : null}
    </label>
  );
}

function Pill({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] bg-[var(--aqua-soft)] py-1 ps-3 pe-1.5 text-[13px] text-[var(--aqua-ink)]">
      {children}
      <button
        type="button"
        onClick={onClear}
        aria-label={`${children}`}
        className="grid size-5 place-items-center rounded-full hover:bg-[var(--aqua)]/30"
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </span>
  );
}
