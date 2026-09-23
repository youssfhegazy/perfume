import { defineField, defineType } from "sanity";

/* Localization pattern from DESIGN.md: fields are objects { ar, en }. */

export const localeString = defineType({
  name: "localeString",
  title: "Localised text",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "string" }),
    defineField({ name: "ar", title: "العربية", type: "string" }),
  ],
});

export const localeText = defineType({
  name: "localeText",
  title: "Localised paragraph",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "text",
      rows: 4,
      validation: (r) => r.max(320),
    }),
    defineField({
      name: "ar",
      title: "العربية",
      type: "text",
      rows: 4,
      validation: (r) => r.max(320),
    }),
  ],
});

export const variant = defineType({
  name: "variant",
  title: "Variant",
  type: "object",
  fields: [
    defineField({
      name: "ml",
      title: "Size (ml)",
      type: "number",
      validation: (r) => r.required().positive().integer(),
    }),
    defineField({
      name: "p",
      title: "Price (EGP)",
      type: "number",
      validation: (r) => r.required().positive().integer(),
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      initialValue: 0,
      validation: (r) => r.required().min(0).integer(),
    }),
  ],
  preview: {
    select: { ml: "ml", p: "p", stock: "stock" },
    prepare: ({ ml, p, stock }) => ({
      title: `${ml} ml · ${p} EGP`,
      subtitle: `${stock} in stock`,
    }),
  },
});

export const note = defineType({
  name: "note",
  title: "Note",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "ar", title: "العربية", type: "string" }),
  ],
  preview: {
    select: { title: "en", subtitle: "ar" },
  },
});

export const notePyramid = defineType({
  name: "notePyramid",
  title: "Scent pyramid",
  type: "object",
  fields: [
    defineField({
      name: "top",
      title: "Top",
      type: "array",
      of: [{ type: "note" }],
    }),
    defineField({
      name: "heart",
      title: "Heart",
      type: "array",
      of: [{ type: "note" }],
    }),
    defineField({
      name: "base",
      title: "Base",
      type: "array",
      of: [{ type: "note" }],
    }),
  ],
});

export const orderItem = defineType({
  name: "orderItem",
  title: "Line item",
  type: "object",
  fields: [
    defineField({
      name: "productId",
      title: "Product",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "ml", title: "Size (ml)", type: "number" }),
    defineField({ name: "qty", title: "Quantity", type: "number" }),
    defineField({
      name: "unitPrice",
      title: "Unit price at purchase",
      type: "number",
      description: "Captured at purchase — never re-read from the product.",
    }),
  ],
});

export const orderTotals = defineType({
  name: "orderTotals",
  title: "Totals",
  type: "object",
  fields: [
    defineField({ name: "subtotal", type: "number" }),
    defineField({ name: "discount", type: "number" }),
    defineField({ name: "shipping", type: "number" }),
    defineField({ name: "giftWrap", type: "number" }),
    defineField({ name: "codFee", type: "number" }),
    defineField({ name: "total", type: "number" }),
  ],
});
