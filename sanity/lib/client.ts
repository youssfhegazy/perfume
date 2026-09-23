import { createClient, type SanityClient } from "next-sanity";

import {
  apiVersion,
  dataset,
  projectId,
  sanityConfigured,
  writeToken,
} from "./env";

let read: SanityClient | null = null;
let write: SanityClient | null = null;

/**
 * Server-side read client.
 *
 * It attaches the token when one is present, for two reasons: private datasets
 * return nothing to anonymous queries, and the CDN would otherwise serve a
 * stale copy for up to a minute after a dashboard write. Sanity does not allow
 * a token together with `useCdn`, so the CDN is only used when reading
 * anonymously from a public dataset.
 *
 * Every read runs in a Server Component or a server action, so the token never
 * reaches the browser. Caching is handled by Next (`revalidate` + tags) in
 * lib/data.ts rather than by Sanity's CDN.
 */
export function readClient(): SanityClient | null {
  if (!sanityConfigured) return null;
  read ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: !writeToken,
    token: writeToken || undefined,
    perspective: "published",
  });
  return read;
}

/** Server-only: carries the write token. */
export function writeClient(): SanityClient | null {
  if (!sanityConfigured || !writeToken) return null;
  write ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: writeToken,
    perspective: "raw",
  });
  return write;
}
