"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { removeProductImage, uploadProductImage } from "@/lib/actions";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { productGallery } from "@/lib/images";
import type { Product } from "@/lib/types";

/* Real uploads: the file goes to Sanity's asset pipeline when a write token is
   present, and to public/images/uploads in seed mode. Until a product has any
   uploaded imagery the seeded packshots are shown, greyed, as placeholders. */

export function MediaUploader({ product }: { product: Product }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploaded = product.gallery;
  const placeholders = uploaded.length === 0 ? productGallery(product) : [];

  function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const body = new FormData();
    body.set("file", file);
    body.set("alt", product.name);

    start(async () => {
      const res = await uploadProductImage(product.id, body);
      if (res.ok) {
        toast.success(dict.admin.uploadDone);
        router.refresh();
      } else {
        const reason = res.errors.file;
        toast.error(
          reason === "size"
            ? dict.admin.uploadTooLarge
            : reason === "type"
              ? dict.admin.uploadBadType
              : dict.admin.uploadFailed,
        );
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function remove(url: string) {
    start(async () => {
      await removeProductImage(product.id, url);
      toast.success(dict.admin.uploadRemoved);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-3 gap-2">
        {uploaded.map((image) => (
          <li
            key={image.url}
            className="group/img relative aspect-[4/5] overflow-hidden border border-[var(--line)] bg-[var(--surface-sunken)]"
          >
            <Image
              src={image.url}
              alt={image.alt?.en ?? ""}
              fill
              sizes="120px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => remove(image.url)}
              disabled={pending}
              aria-label={dict.admin.uploadRemove}
              className="absolute top-1 end-1 grid size-6 place-items-center rounded-full bg-[var(--surface-raised)] text-[var(--danger)] opacity-0 shadow-[var(--shadow-soft)] transition-opacity group-hover/img:opacity-100 focus-visible:opacity-100"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </li>
        ))}

        {placeholders.map((src) => (
          <li
            key={src}
            className="relative aspect-[4/5] overflow-hidden border border-dashed border-[var(--line-strong)] bg-[var(--surface-sunken)]"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="120px"
              className="object-cover opacity-45"
            />
          </li>
        ))}
      </ul>

      {/* Drop target */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-2 border border-dashed p-5 text-center transition-colors",
          dragging
            ? "border-[var(--primary-c)] bg-[var(--aqua-soft)]"
            : "border-[var(--line-strong)]",
        )}
      >
        <ImagePlus
          className="size-5 text-[var(--ink-muted)]"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="text-[13px] text-[var(--ink-muted)]">
          {dict.admin.uploadHint}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="min-h-9 rounded-[var(--r-md)] border border-[var(--line-strong)] px-4 text-[13px] font-semibold disabled:opacity-45"
        >
          {pending ? dict.admin.uploading : dict.admin.uploadChoose}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => upload(e.target.files)}
          className="sr-only"
          aria-label={dict.admin.uploadChoose}
        />
      </div>

      <p className="text-[12px] text-[var(--ink-muted)]">{product.hint}</p>
    </div>
  );
}
