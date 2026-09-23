import "server-only";

import { cloneSeed } from "@/lib/seed";
import type { Catalog } from "@/lib/types";

/* In-process catalogue used when Sanity is not configured, so the app is
   fully usable — dashboard writes included — before a project is provisioned.
   State lives for the life of the server process; it is not a database.
   Configure NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_WRITE_TOKEN to swap in the
   real backend (see lib/data.ts). */

const KEY = Symbol.for("maison-oud.catalog");

type Holder = { [KEY]?: Catalog };

export function memoryCatalog(): Catalog {
  const g = globalThis as Holder;
  g[KEY] ??= cloneSeed();
  return g[KEY];
}

export function setMemoryCatalog(next: Catalog) {
  (globalThis as Holder)[KEY] = next;
}

export function resetMemoryCatalog() {
  setMemoryCatalog(cloneSeed());
}
