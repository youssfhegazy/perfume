"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MoButton } from "@/components/brand/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PromptDialog } from "@/components/admin/prompt-dialog";
import {
  AdminCard,
  FilterPill,
  ProductStatusPill,
  TableShell,
  Td,
  Th,
  adminInput,
} from "@/components/admin/ui";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  addTagToProducts,
  deleteProduct,
  resetCatalog,
  setProductStatus,
} from "@/lib/actions";
import { count, FAMILIES, listPrice, money, totalStock } from "@/lib/format";
import { t } from "@/lib/i18n/dictionary";
import { productImage } from "@/lib/images";
import type { Family, Product } from "@/lib/types";

type SortKey = "name" | "price" | "stock";

export function ProductsModule({ products }: { products: Product[] }) {
  const { dict, locale, href } = useLocale();
  const [pending, start] = useTransition();

  const [query, setQuery] = useState("");
  const [families, setFamilies] = useState<Family[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [tagError, setTagError] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (families.length && !families.includes(p.fam)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.ar.includes(query.trim()) ||
        p.sku.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      if (sortKey === "price") cmp = listPrice(a) - listPrice(b);
      if (sortKey === "stock") cmp = totalStock(a) - totalStock(b);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [products, query, families, sortKey, sortDir]);

  function sortBy(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleFamily(f: Family) {
    setFamilies((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }

  function toggleRow(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const allSelected = rows.length > 0 && selected.length === rows.length;

  function confirmDelete() {
    const p = toDelete;
    if (!p) return;
    start(async () => {
      const res = await deleteProduct(p.id);
      if (res.ok) toast.success(dict.admin.deleted);
      setSelected((s) => s.filter((id) => id !== p.id));
      setToDelete(null);
    });
  }

  function bulkStatus(status: Product["status"]) {
    start(async () => {
      await setProductStatus(selected, status);
      toast.success(dict.admin.savedOk);
      setSelected([]);
    });
  }

  function applyTag() {
    if (!tagDraft.trim()) {
      setTagError(dict.admin.tagRequired);
      return;
    }
    const n = selected.length;
    start(async () => {
      const res = await addTagToProducts(selected, tagDraft);
      if (res.ok) {
        toast.success(t(dict.admin.tagged, { n: count(n, locale) }));
        setTagOpen(false);
        setTagDraft("");
        setTagError("");
        setSelected([]);
      } else {
        setTagError(dict.admin.tagRequired);
      }
    });
  }

  function onReset() {
    start(async () => {
      const res = await resetCatalog();
      if (res.ok) toast.success(dict.admin.resetDone);
      else toast.error(dict.common.saveFailed);
      setSelected([]);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.admin.searchProducts}
          aria-label={dict.admin.searchProducts}
          className={cn(adminInput(), "w-full max-w-[280px]")}
        />
        <div className="flex flex-wrap gap-1.5">
          {FAMILIES.map((f) => (
            <FilterPill
              key={f}
              active={families.includes(f)}
              onClick={() => toggleFamily(f)}
            >
              {dict.families[f]}
            </FilterPill>
          ))}
        </div>
        <p className="num text-[13px] text-[var(--ink-muted)]">
          {count(rows.length, locale)}
        </p>
        <button
          type="button"
          onClick={onReset}
          disabled={pending}
          className="ms-auto text-[13px] text-[var(--ink-muted)] underline decoration-[var(--aqua)] underline-offset-4 hover:text-[var(--ink)]"
        >
          {dict.admin.resetSeed}
        </button>
      </div>

      {/* Bulk-select bar */}
      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--r-md)] bg-[var(--aqua-soft)] px-4 py-2.5">
          <span className="num text-[13px] font-semibold text-[var(--aqua-ink)]">
            {t(dict.admin.selected, { n: count(selected.length, locale) })}
          </span>
          <MoButton
            size="chip"
            variant="subtle"
            onClick={() => bulkStatus("live")}
          >
            {dict.admin.publish}
          </MoButton>
          <MoButton
            size="chip"
            variant="subtle"
            onClick={() => {
              setTagError("");
              setTagOpen(true);
            }}
          >
            {dict.admin.addTag}
          </MoButton>
          <MoButton
            size="chip"
            variant="subtle"
            onClick={() => bulkStatus("archived")}
          >
            {dict.admin.archive}
          </MoButton>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ms-auto text-[13px] text-[var(--aqua-ink)] underline underline-offset-4"
          >
            {dict.admin.clear}
          </button>
        </div>
      ) : null}

      {/* Desktop table */}
      <AdminCard className="hidden md:flex">
        <TableShell minWidth={820}>
          <thead>
            <tr>
              <Th className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? [] : rows.map((r) => r.id))
                  }
                  aria-label={dict.admin.selected}
                  className="size-4 accent-[var(--primary-c)]"
                />
              </Th>
              <Th
                onSort={() => sortBy("name")}
                sorted={sortKey === "name"}
                dir={sortDir}
              >
                {dict.admin.colProduct}
              </Th>
              <Th>{dict.admin.colSku}</Th>
              <Th>{dict.admin.colFamily}</Th>
              <Th
                align="end"
                onSort={() => sortBy("price")}
                sorted={sortKey === "price"}
                dir={sortDir}
              >
                {dict.admin.colPrice}
              </Th>
              <Th
                align="end"
                onSort={() => sortBy("stock")}
                sorted={sortKey === "stock"}
                dir={sortDir}
              >
                {dict.admin.colStock}
              </Th>
              <Th>{dict.admin.colStatus}</Th>
              <Th align="end">{dict.admin.colActions}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const stock = totalStock(p);
              return (
                <tr
                  key={p.id}
                  className={cn(
                    "transition-colors hover:bg-[var(--aqua-soft)]",
                    selected.includes(p.id) && "bg-[var(--aqua-soft)]",
                  )}
                >
                  <Td>
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleRow(p.id)}
                      aria-label={p.name}
                      className="size-4 accent-[var(--primary-c)]"
                    />
                  </Td>
                  <Td>
                    <Link
                      href={href(`/admin/products/${p.id}`)}
                      className="flex items-center gap-3"
                    >
                      <span className="relative h-11 w-9 shrink-0 overflow-hidden bg-[var(--surface-sunken)]">
                        <Image
                          src={productImage(p)}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {p.name}
                        </span>
                        <span className="block truncate text-[12px] text-[var(--ink-muted)]">
                          {p.ar}
                        </span>
                        {p.tags.length ? (
                          <span className="mt-1 flex flex-wrap gap-1">
                            {p.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-[var(--r-full)] bg-[var(--aqua-soft)] px-2 py-px text-[11px] text-[var(--aqua-ink)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </Td>
                  <Td className="num" >
                    <span dir="ltr">{p.sku}</span>
                  </Td>
                  <Td>{dict.families[p.fam]}</Td>
                  <Td align="end">{money(listPrice(p), locale)}</Td>
                  <Td
                    align="end"
                    className={cn(
                      stock <= 5
                        ? "text-[var(--danger)]"
                        : stock <= 25
                          ? "text-[var(--warning)]"
                          : "",
                    )}
                  >
                    {count(stock, locale)}
                  </Td>
                  <Td>
                    <ProductStatusPill status={p.status} d={dict} />
                  </Td>
                  <Td align="end">
                    <span className="flex items-center justify-end gap-1">
                      <Link
                        href={href(`/admin/products/${p.id}`)}
                        aria-label={`${dict.admin.edit} ${p.name}`}
                        className="grid size-8 place-items-center rounded-[var(--r-md)] hover:bg-[var(--surface-sunken)]"
                      >
                        <Pencil className="size-4" strokeWidth={1.5} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(p)}
                        disabled={pending}
                        aria-label={`${dict.admin.delete} ${p.name}`}
                        className="grid size-8 place-items-center rounded-[var(--r-md)] text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </AdminCard>

      {/* Mobile card list — the table's action column was unreachable without
          horizontal scrolling. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((p) => {
          const stock = totalStock(p);
          return (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggleRow(p.id)}
                  aria-label={p.name}
                  className="mt-1 size-4 shrink-0 accent-[var(--primary-c)]"
                />
                <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-[var(--surface-sunken)]">
                  <Image
                    src={productImage(p)}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-[12px] text-[var(--ink-muted)]">
                    {p.ar}
                  </p>
                </div>
                <ProductStatusPill status={p.status} d={dict} />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--ink-muted)]">
                <span className="num" dir="ltr">
                  {p.sku}
                </span>
                <span>{dict.families[p.fam]}</span>
                <span className="num">{money(listPrice(p), locale)}</span>
                <span
                  className={cn(
                    "num",
                    stock <= 5
                      ? "text-[var(--danger)]"
                      : stock <= 25
                        ? "text-[var(--warning)]"
                        : "",
                  )}
                >
                  {t(dict.admin.inStock, { n: count(stock, locale) })}
                </span>
              </div>

              <div className="flex gap-2 border-t border-[var(--line)] pt-3">
                <Link
                  href={href(`/admin/products/${p.id}`)}
                  className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-[var(--r-md)] border border-[var(--line-strong)] text-[13px] font-semibold"
                >
                  <Pencil className="size-3.5" strokeWidth={1.5} />
                  {dict.admin.edit}
                </Link>
                <MoButton
                  size="admin"
                  variant="dangerSoft"
                  onClick={() => setToDelete(p)}
                  disabled={pending}
                  className="flex-1"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                  {dict.admin.delete}
                </MoButton>
              </div>
            </li>
          );
        })}
      </ul>

      <PromptDialog
        open={tagOpen}
        title={t(dict.admin.tagDialogTitle, {
          n: count(selected.length, locale),
        })}
        label={dict.admin.tags}
        value={tagDraft}
        error={tagError}
        placeholder={dict.admin.tagAdd}
        confirmLabel={dict.admin.addTag}
        pending={pending}
        onChange={setTagDraft}
        onConfirm={applyTag}
        onCancel={() => setTagOpen(false)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        name={toDelete ? toDelete.name : ""}
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
