# Maison Oud

Bilingual (Arabic RTL / English LTR) storefront and admin dashboard for a niche
perfume house in Cairo, built from the handoff in
`../design_handoff_maison_oud`.

**Stack:** Next.js 16 (App Router, Turbopack) · Sanity.io · Framer Motion ·
shadcn/ui · Tailwind CSS v4 · TypeScript.

---

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000> — `/` redirects to `/ar` or `/en` based on
`Accept-Language`.

The app runs on the seed catalogue in `lib/seed.json` out of the box, dashboard
writes included, so there is nothing to provision before you can click through
every screen. See **Data layer** to point it at Sanity.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run images` | Re-fetch the placeholder photography |
| `npm run sanity:seed` | Push the seed catalogue into Sanity |
| `npm run admin:create` | Create a dashboard user |

See **[FEATURES.md](FEATURES.md)** for a full audit of what works end to end,
what is surface-only, and what is still missing.

---

## Routes

### Storefront — `app/[locale]/(store)`

| Route | Screen |
| --- | --- |
| `/[locale]` | Home — hero, family tiles, bestsellers, story band, notes gallery, testimonials, newsletter |
| `/[locale]/collection` | Collection (PLP) — sidebar filters, sort, active-filter pills, empty state |
| `/[locale]/product/[slug]` | Product (PDP) — gallery, variants, scent pyramid, longevity/sillage meters, accordion, related |
| `/[locale]/checkout` | Checkout — three steps, coupon, order summary |
| `/[locale]/checkout/confirmation` | Confirmation — reads the created order |
| `/[locale]/track` | Order tracking — order number + phone |
| `/[locale]/wishlist` | Saved fragrances |

The bag drawer, announcement bar, header, search overlay and footer live in
the `(store)` layout and are present on every storefront page. Search matches
on either language's product name, the family label and every note — so
"saffron", "floral" and "عود" all return sensible results. Recent searches
persist per viewer.

### Dashboard — `app/[locale]/admin`

| Route | Module |
| --- | --- |
| `/[locale]/admin` | Overview — KPIs, revenue chart, low stock, latest orders |
| `/[locale]/admin/products` | Products — sortable table, bulk select; card list below `md` |
| `/[locale]/admin/products/[id]` | Product editor (`new` for a blank draft) |
| `/[locale]/admin/orders` | Orders — status filters |
| `/[locale]/admin/orders/[id]` | Order detail — items, totals, timeline, fulfilment |
| `/[locale]/admin/reviews` | Testimonials — moderate + composer |
| `/[locale]/admin/discounts` | Coupons |
| `/[locale]/admin/shipping` | Shipping zones |
| `/[locale]/admin/login` | Sign in |

`/studio` embeds Sanity Studio for power editing.

### Signing in

The dashboard is behind authentication. Set `AUTH_SECRET`, then create an
account:

```bash
npm run admin:create -- you@example.com "a-long-password" owner "Your Name"
```

Roles are Owner, Admin, Editor (content only) and Fulfilment (orders only).
The nav is filtered per role, direct URLs are denied, and every mutating
action re-checks the permission server-side. See FEATURES.md → Authentication.

### Showing it to a client

Set `NEXT_PUBLIC_DEMO_MODE=1` and fill in the `DEMO_*` accounts in
`.env.local`. The storefront footer then offers two buttons:

- **Open the demo** — straight into the dashboard as an owner, nothing typed.
- **Sign in** — the real login page, which lists the three demo accounts as
  quick-fill so you can show what each role sees.

Only the addresses named in `DEMO_*` can be signed into without a password,
and only while the flag is on. The server action checks the flag itself, so a
stale build cannot leave the door open. **Leave it empty in production.**

Destructive actions go through a confirm dialog (`components/admin/confirm-dialog.tsx`)
rather than deleting outright, per the data contracts.

---

## Data layer

`lib/data.ts` is the single read path for both surfaces. It uses Sanity when a
project id is present and the in-process seed catalogue otherwise, so nothing
upstream branches on which backend is live.

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WRITE_TOKEN=your-write-token   # server-only
```

Then seed it:

```bash
npm run sanity:seed
```

Writes go through server actions in `lib/actions.ts`, which validate on the
server and hit Sanity when `SANITY_WRITE_TOKEN` is set. Without it they mutate
the in-process catalogue (`lib/store/memory.ts`) — fine for a demo, but that
state lives only for the life of the server process.

Schemas are in `sanity/schemas`, GROQ projections in `sanity/lib/queries.ts`.
The projections shape documents into the domain types in `lib/types.ts`, so the
rest of the app never sees Sanity's shape.

### Orders

`lib/orders.ts` owns placement. The browser sends only *what* it wants —
`{productId, ml, qty}` — never what it costs. The server re-prices every line
from the catalogue, re-checks the coupon against the same rules the UI
previewed, applies the governorate's delivery fee, and refuses the whole order
if any line would oversell. The order, the stock decrements and the coupon's
redemption count are one Sanity transaction.

Cash on delivery is complete. Card and wallet create the order as
`paymentStatus: "pending"` and stop — nothing is marked paid without a verified
gateway webhook. See FEATURES.md → Payment.

### What is not wired yet

Card and wallet payment needs Paymob credentials, and
`lib/notifications.ts` logs what it would email or text until a provider is
implemented. Customer accounts are out of scope; guest checkout and order
tracking both work.

The read client attaches the token when one is set: the dataset only returns
documents to authenticated requests, and it also keeps a dashboard write
visible immediately rather than up to a minute later. Reads only ever run on
the server, so the token never reaches the browser.

Search runs client-side over the live catalogue. It is not backed by a search
index — swap in a real one before the catalogue outgrows a single fetch.

---

## Design system

Tokens live in `app/globals.css` as CSS custom properties, switched by
`data-theme`. **Pearl** is the light default, **Abyss** the dark theme. The
shadcn variables (`--background`, `--primary`, `--border`, …) are aliased onto
the brand tokens, so shadcn primitives inherit the brand rather than being
re-skinned one at a time.

- **Type** — Cormorant Garamond + Manrope for Latin, Amiri + IBM Plex Sans
  Arabic for Arabic. The pair swaps on `:lang(ar)`; all four are self-hosted by
  `next/font`.
- **Motion** — `lib/motion.ts` holds the one easing curve
  (`cubic-bezier(.22, 1, .36, 1)`) and the duration/stagger tokens. Every
  reveal renders its end state immediately under `prefers-reduced-motion`.
- **Buttons** — `components/brand/button.tsx`: 44px and `radius-sm` on the
  storefront, 36px and `radius-md` in the dashboard. Height is always
  `min-height` plus padding, never fixed — Arabic labels wrap.
- **Modals** — the bag drawer, both nav drawers, the search overlay, the
  command palette and the confirm dialog share `useFocusTrap` /
  `useScrollLock`: focus moves in on open, Tab cycles inside, Escape closes and
  focus returns to whatever opened it.

### Two things worth knowing

**The eyebrow class is not called `overline`.** Tailwind ships an `overline`
utility for `text-decoration-line`, and it wins, drawing a rule above the
label. The brand class is `.eyebrow`.

**Every grid track uses `minmax(0, …)`.** An `auto` track is sized by its
content's intrinsic width, which is what pushed the newsletter band and the
variants table wider than the viewport on phones. The handoff flags this as the
cause of every overflow bug in the prototype; it is still the cause here.

---

## Bilingual & RTL

- Locale is a URL segment (`/ar`, `/en`). `proxy.ts` redirects `/` by
  `Accept-Language`. `hreflang` and canonicals are emitted per page.
- Every directional value uses logical properties — `ms-*`, `pe-*`, `start-*`,
  `end-*`. shadcn was generated with its RTL mode on, so its primitives use
  them too.
- **Bidi isolation is applied to every numeric run.** `lib/format.ts` wraps
  prices, sizes, ratings, stock counts, quantities and order ids in
  `U+2068 … U+2069`. Without it `100 مل` renders as `مل 100` and the currency
  lands on the wrong side. Anything you add that interpolates a number into
  Arabic copy needs to go through `count()`, `money()`, `ml()` or `iso()`.
- Plurals go through `plural()` with `Intl.PluralRules` — English needs
  one/other, Arabic has six categories.
- Arabic numerals in body copy are Eastern Arabic (٢٠٠٠); data values stay
  Western inside the isolate.

---

## Imagery

**All photography is placeholder**, sourced from Unsplash and cropped to the
layout by `scripts/fetch-images.mjs`. Slots, credits and licence are in
`public/images/CREDITS.md`. Replace the set before launch — the art direction
for the real shoot is in `design_handoff_maison_oud/DESIGN.md`.

Products from Sanity use their `gallery` field; `lib/images.ts` paths are the
fallback until the shoot lands.

---

## Project layout

```
app/[locale]/(store)   storefront routes
app/[locale]/admin     dashboard routes
app/studio             embedded Sanity Studio
components/brand       buttons, badges, meters, reveals — the design system
components/store       storefront-specific components
components/admin       dashboard shell and modules
components/ui          shadcn primitives (RTL mode)
lib/                   types, seed, data layer, actions, format, motion, i18n
sanity/                schemas, client, GROQ queries
scripts/               image fetcher, Sanity seeder
```
