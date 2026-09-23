export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

/** Server-only. Never reaches the client. */
export const writeToken = process.env.SANITY_WRITE_TOKEN ?? "";

/**
 * The app runs on the seed catalogue until a project id is present, so it is
 * usable before Sanity is provisioned. Set NEXT_PUBLIC_SANITY_PROJECT_ID to
 * switch the data layer over.
 */
export const sanityConfigured = projectId.length > 0;
export const sanityWritable = sanityConfigured && writeToken.length > 0;
