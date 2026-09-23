"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schema } from "@/sanity/schemas";
import { apiVersion, dataset, projectId } from "@/sanity/lib/env";

/* Sanity Studio, embedded at /studio.

   The custom dashboard at /admin is where the client works day to day; this is
   the power-editing fallback (bulk edits, references, revision history). */

export default defineConfig({
  name: "maison-oud",
  title: "Maison Oud",
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});
