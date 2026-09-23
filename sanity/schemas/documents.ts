import { defineField, defineType } from "sanity";

const FAMILIES = [
  { title: "Oriental Woody", value: "woody" },
  { title: "Floral", value: "floral" },
  { title: "Amber", value: "amber" },
  { title: "Fresh", value: "fresh" },
  { title: "Musk", value: "musk" },
  { title: "Spicy", value: "spicy" },
];

const SEASONS = [
  { title: "Spring", value: "spring" },
  { title: "Summer", value: "summer" },
  { title: "Autumn", value: "autumn" },
  { title: "Winter", value: "winter" },
  { title: "Day", value: "day" },
  { title: "Evening", value: "evening" },
  { title: "Night", value: "night" },
];

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "commerce", title: "Commerce" },
    { name: "scent", title: "Scent" },
    { name: "media", title: "Media" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "name",
      title: "Name (English)",
      type: "string",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ar",
      title: "Name (Arabic)",
      type: "string",
      group: "content",
      description: "Falls back to the English name when empty.",
    }),
    defineField({
      name: "desc",
      title: "Description",
      type: "localeText",
      group: "content",
    }),
    defineField({
      name: "badge",
      title: "Merchandising badge",
      type: "localeString",
      group: "content",
      description: "Bestseller, New, Limited. Leave empty for none.",
    }),

    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      group: "commerce",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "commerce",
      initialValue: "draft",
      options: {
        list: [
          { title: "Live", value: "live" },
          { title: "Draft", value: "draft" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "variants",
      title: "Variants",
      type: "array",
      group: "commerce",
      of: [{ type: "variant" }],
      validation: (r) => r.required().min(1),
    }),

    defineField({
      name: "fam",
      title: "Fragrance family",
      type: "string",
      group: "scent",
      options: { list: FAMILIES },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "conc",
      title: "Concentration",
      type: "string",
      group: "scent",
      options: {
        list: [
          { title: "Eau de Parfum", value: "EDP" },
          { title: "Elixir", value: "Elixir" },
          { title: "Extrait", value: "Extrait" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "notes",
      title: "Notes & accords",
      type: "notePyramid",
      group: "scent",
    }),
    defineField({
      name: "lon",
      title: "Longevity (1–5)",
      type: "number",
      group: "scent",
      initialValue: 3,
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: "sil",
      title: "Sillage (1–5)",
      type: "number",
      group: "scent",
      initialValue: 3,
      validation: (r) => r.min(1).max(5),
    }),
    defineField({
      name: "seasons",
      title: "Season & time",
      type: "array",
      group: "scent",
      of: [{ type: "string" }],
      options: { list: SEASONS },
    }),

    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt text", type: "localeString" },
          ],
        },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "hint",
      title: "Photography brief",
      type: "string",
      group: "media",
      description: "Design-time only. Not rendered on the storefront.",
    }),

    // Read-only in the editor — derived from reviews.
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      group: "commerce",
      readOnly: true,
    }),
    defineField({
      name: "reviews",
      title: "Review count",
      type: "number",
      group: "commerce",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "sku", media: "gallery.0" },
  },
});

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "pending",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "stars",
      title: "Rating",
      type: "number",
      validation: (r) => r.required().min(1).max(5).integer(),
    }),
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({ name: "location", title: "Location", type: "localeString" }),
    defineField({
      name: "body",
      title: "Quote",
      type: "localeText",
      validation: (r) => r.required(),
    }),
    defineField({ name: "reply", title: "Reply", type: "localeText" }),
  ],
  preview: {
    select: { title: "author.en", subtitle: "status" },
  },
});

export const order = defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "number",
      title: "Order number",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Packed", value: "packed" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
    }),
    defineField({ name: "placedAt", title: "Placed at", type: "datetime" }),
    defineField({
      name: "customer",
      title: "Customer",
      type: "object",
      fields: [
        { name: "name", type: "string" },
        { name: "phone", type: "string" },
        { name: "email", type: "string" },
      ],
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "object",
      fields: [
        { name: "governorate", type: "string" },
        { name: "street", type: "string" },
      ],
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "orderItem" }],
    }),
    defineField({
      name: "shipping",
      title: "Shipping method",
      type: "string",
      options: {
        list: [
          { title: "Standard", value: "standard" },
          { title: "Express", value: "express" },
        ],
      },
    }),
    defineField({
      name: "payment",
      title: "Payment method",
      type: "string",
      options: {
        list: [
          { title: "Cash on delivery", value: "cod" },
          { title: "Card", value: "card" },
          { title: "Mobile wallet", value: "wallet" },
        ],
      },
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment status",
      type: "string",
      initialValue: "due",
      options: {
        list: [
          { title: "Due (cash on delivery)", value: "due" },
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Refunded", value: "refunded" },
          { title: "Failed", value: "failed" },
        ],
      },
    }),
    defineField({ name: "giftWrap", title: "Gift wrap", type: "boolean" }),
    defineField({ name: "coupon", title: "Coupon code", type: "string" }),
    defineField({ name: "totals", title: "Totals", type: "orderTotals" }),
  ],
  preview: {
    select: { title: "number", subtitle: "customer.name" },
  },
});

export const coupon = defineType({
  name: "coupon",
  title: "Coupon",
  type: "document",
  fields: [
    defineField({
      name: "code",
      title: "Code",
      type: "string",
      validation: (r) =>
        r
          .required()
          .regex(/^[A-Z0-9]{4,16}$/, {
            name: "code",
            invert: false,
          })
          .error("Codes are letters and numbers, 4–16 characters."),
    }),
    defineField({
      name: "pct",
      title: "Percent off",
      type: "number",
      validation: (r) => r.required().min(1).max(90),
    }),
    defineField({
      name: "used",
      title: "Redemptions",
      type: "number",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "on",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "usageLimit",
      title: "Usage limit",
      type: "number",
      description: "Maximum redemptions. Leave empty for unlimited.",
      validation: (r) => r.min(1).integer(),
    }),
    defineField({
      name: "minOrder",
      title: "Minimum order (EGP)",
      type: "number",
      validation: (r) => r.min(0),
    }),
    defineField({ name: "startsAt", title: "Starts at", type: "datetime" }),
    defineField({ name: "endsAt", title: "Ends at", type: "datetime" }),
  ],
  preview: { select: { title: "code", subtitle: "pct" } },
});

export const shippingZone = defineType({
  name: "shippingZone",
  title: "Shipping zone",
  type: "document",
  fields: [
    defineField({
      name: "governorate",
      title: "Governorate id",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "gov", title: "Governorate", type: "localeString" }),
    defineField({
      name: "fee",
      title: "Fee (EGP)",
      type: "number",
      validation: (r) => r.required().min(0),
    }),
    defineField({ name: "eta", title: "Delivery ETA", type: "localeString" }),
    defineField({
      name: "cod",
      title: "Cash on delivery available",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: { select: { title: "gov.en", subtitle: "fee" } },
});

export const subscriber = defineType({
  name: "subscriber",
  title: "Newsletter subscriber",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "العربية", value: "ar" },
        ],
      },
    }),
    defineField({ name: "createdAt", title: "Subscribed at", type: "datetime" }),
  ],
  preview: { select: { title: "email", subtitle: "locale" } },
});

export const user = defineType({
  name: "user",
  title: "Dashboard user",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      initialValue: "editor",
      options: {
        list: [
          { title: "Owner", value: "owner" },
          { title: "Admin", value: "admin" },
          { title: "Editor (content only)", value: "editor" },
          { title: "Fulfilment (orders only)", value: "fulfilment" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "passwordHash",
      title: "Password hash",
      type: "string",
      description:
        "scrypt hash. Never a plaintext password. Set it with `npm run admin:create`.",
      readOnly: true,
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: { select: { title: "name", subtitle: "role" } },
});
