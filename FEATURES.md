# Features — Maison Oud

What is built, what is surface-only, and what is missing. Audited against the
source on 2026-09-22, and verified against a live Sanity dataset.

**Legend**

| | Meaning |
| --- | --- |
| ✅ | Works end to end — state changes and persists through the data layer |
| 🟡 | UI is complete and to spec, but the action behind it is not wired |
| ⛔ | Not built |

> "Persists" means through `lib/data.ts` → Sanity when configured, or the
> in-process catalogue otherwise. See README → Data layer.

---

## 1. Storefront

### Global chrome

| Feature | | Notes |
| --- | --- | --- |
| Announcement bar | ✅ | Deep band, dismissible, hidden for the rest of the session |
| Sticky header | ✅ | Wordmark, nav, search, locale, theme, account, bag + count |
| Mobile nav drawer | ✅ | Slides from the inline start, closes on backdrop / × / Escape / navigation |
| Search overlay | ✅ | Matches product name (both languages), family and every note. Recent searches persist |
| Bag drawer | ✅ | Free-delivery meter, steppers, upsell, gift wrap, subtotal |
| Wishlist link | ✅ | In the header (heart fills when non-empty) and the mobile drawer |
| Footer | ✅ | 4-column, link groups, payment methods |
| Locale switch | ✅ | Swaps the URL segment, keeps the current path |
| Theme switch | ✅ | Pearl ⇄ Abyss, persists |
| 404 / 500 pages | ✅ | `not-found.tsx` / `error.tsx` |
| Cookie consent | ⛔ | Listed in DESIGN.md global chrome |
| WhatsApp floating contact | ⛔ | Listed in DESIGN.md global chrome |

Nav links for **Fragrance families / Gifts / Discovery sets / Journal** all
resolve to `/collection` — those pages do not exist yet.

### Home

| Section | | Notes |
| --- | --- | --- |
| Hero | ✅ | Reveal on load, clip-path image reveal |
| Family tiles | ✅ | Live counts, 2px accent top border per family, links to a filtered PLP |
| Bestsellers grid | ✅ | Live products |
| Story band | ✅ | Full-bleed deep band |
| Notes gallery | ✅ | Four 1:1 material shots |
| Testimonials | ✅ | **Driven by approved testimonials from the dashboard.** Whole section hides when none |
| Newsletter | ✅ | Validates, normalises and stores the address as a `subscriber` document. Re-subscribing is idempotent |

### Collection (PLP)

| Feature | | Notes |
| --- | --- | --- |
| Family / concentration filters | ✅ | With live counts |
| Price range | ✅ | 1800–5000, step 50 |
| In-stock only | ✅ | |
| Sort | ✅ | Featured · Newest · Price ↑ · Price ↓ |
| Active-filter pills | ✅ | Individually clearable |
| Mobile filter panel | ✅ | Chip toggles an inline panel with a "Show results (n)" button |
| Empty state | ✅ | With "Clear all filters" |
| Deep link `?family=` | ✅ | Family tiles land pre-filtered |
| Pagination / infinite load | ⛔ | Not needed at 6 products; will be at 60 |

### Product (PDP)

| Feature | | Notes |
| --- | --- | --- |
| Gallery + 4-up thumbnails | ✅ | Active thumb takes the aqua border |
| Variant selector | ✅ | Per-variant price and stock; out-of-stock sizes disabled |
| Quantity stepper | ✅ | |
| Add to bag | ✅ | Opens the drawer, pops the bag count |
| Wishlist | ✅ | Toggles, persists, and has its own page at `/[locale]/wishlist` |
| Stock line | ✅ | In stock / Only N left / Sold out |
| Scent pyramid | ✅ | Top · Heart · Base, per-note imagery, 150ms tier stagger |
| Longevity / sillage meters | ✅ | |
| Season & time pills | ✅ | |
| Accordion | ✅ | Single-open: shipping, how to wear, ingredients |
| Related products | ✅ | Same family first |
| Sticky mobile add-to-bag | ✅ | |
| Customer reviews | ⛔ | `rating` / `reviews` are static numbers on the product |

### Bag & checkout

| Feature | | Notes |
| --- | --- | --- |
| Cart persistence | ✅ | `localStorage`, survives reload |
| Free-delivery meter | ✅ | Animates to `subtotal / 2000` |
| Upsell | ✅ | "Complete the ritual" |
| Gift wrap | ✅ | 150 EGP, carries into checkout |
| 3-step checkout | ✅ | Contact → Shipping → Payment |
| Field validation | ✅ | Deferred until first submit; email regex; error fill + inline message |
| Governorate select | ✅ | All 8 zones |
| **Zone-based delivery pricing** | ✅ | Reads the governorate's fee — the flat-rate gap the handoff flagged is closed |
| Free over 2,000 EGP | ✅ | Standard shipping only |
| Express delivery | ✅ | 120 EGP, overrides free |
| Coupon | ✅ | Shared rules in `lib/coupons.ts` — active, date window, usage limit, minimum order. The preview and the server run the same check |
| Payment | ✅ COD · ⛔ card/wallet | Cash on delivery is complete and lands as `paymentStatus: "due"`. Card and wallet record `"pending"` and need a Paymob integration — nothing is ever marked paid without a verified webhook |
| Order summary | ✅ | Zero rows are hidden, per the contract |
| Confirmation page | ✅ | Reads the created order by id, not the URL. Unknown id → 404 |
| **Order actually created** | ✅ | `placeOrder` in `lib/orders.ts` re-prices every line from the catalogue, checks stock, writes the order, decrements stock and increments the coupon — all in one Sanity transaction |
| Inventory decrement | ✅ | Per variant, via Sanity `dec()` so concurrent orders cannot both read the same starting value. An order that would oversell is refused whole |

---

## 2. Dashboard

| Feature | | Notes |
| --- | --- | --- |
| Sidebar | ✅ | 248px, collapsible to a 68px rail; auto-rail on tablet; drawer on phones |
| Bottom tab bar | ✅ | Below `md`: Overview · Orders · Products · More |
| Command palette (⌘K) | ✅ | Indexes modules, every product and every order |
| Toasts | ✅ | Success / failure, 2800ms |
| Contextual "New product" | ✅ | Only on Overview, Products and Product editor, per spec |

### Modules

| Module | | Notes |
| --- | --- | --- |
| **Overview** | ✅ | KPI row, inline SVG revenue chart with 3M/6M/12M, low stock, latest orders. KPI values are fixed demo figures |
| **Products** — list | ✅ | Search, family filters, sortable name/price/stock, card list below `md` |
| Products — bulk publish / archive | ✅ | Writes through |
| Products — bulk "Add tag" | ✅ | Prompt dialog, validated, appends to the product's `tags`; pills show in the list |
| Products — delete | ✅ | Behind a confirm dialog |
| Reset to seed data | ✅ | Seed-mode only; refuses when Sanity is writable |
| **Product editor** | ✅ | EN/العربية tabs, description counter, SKU, family, concentration |
| Editor — variants | ✅ | Add / remove / edit, price validated > 0 |
| Editor — notes | ✅ | Add on Enter, removable pills, per tier |
| Editor — longevity / sillage | ✅ | |
| Editor — tags | ✅ | Add on Enter, removable pills |
| Editor — save / discard | ✅ | Validates first, flags every offending field, writes nothing on failure |
| Editor — media | ✅ | Drag-and-drop or file picker. Uploads to Sanity's asset pipeline (or `public/images/uploads` in seed mode), with type and 5 MB limits, and per-image removal. Uploaded imagery replaces the placeholders everywhere |
| **Orders** — list | ✅ | Status filters, card list on phones |
| **Order detail** | ✅ | Items, totals, 4-step timeline, customer card |
| Order — advance status | ✅ | new → packed → shipped → delivered → reopen |
| Order — print invoice | ✅ | Real invoice: letterhead, billed-to block, items and totals. Print CSS drops the chrome and forces a light palette |
| Order — tracking number / notes / refund | ⛔ | |
| **Reviews** | ✅ | Approve / reject / delete (confirmed), filters |
| Reviews — composer | ✅ | Validated; created testimonials are approved immediately |
| Reviews — reply | ✅ | Inline composer; the reply persists and renders under the quote on the storefront |
| **Discounts** | ✅ | Create with format + duplicate + range validation, pause / activate |
| Discounts — usage limits, dates | ✅ | `usageLimit`, `minOrder`, `startsAt`, `endsAt` on the model and enforced at checkout; `used` increments on every order |
| **Shipping zones** | ✅ | Editable fee, COD toggle, refuses to save while any fee is invalid |

---

## 3. Cross-cutting

| Feature | | Notes |
| --- | --- | --- |
| Bilingual AR / EN | ✅ | Every string in both; locale is a URL segment |
| Full RTL | ✅ | Logical properties throughout; shadcn generated in RTL mode |
| **Bidi isolation** | ✅ | Every numeric run wrapped in U+2068…U+2069 |
| Plurals | ✅ | `Intl.PluralRules` — EN two forms, AR six |
| Dual theme | ✅ | Pearl / Abyss, persisted, no flash |
| Font pair swap | ✅ | Cormorant+Manrope ⇄ Amiri+IBM Plex Arabic, self-hosted |
| Motion system | ✅ | One easing curve; reveals, image clips, staggers, drawer transitions |
| `prefers-reduced-motion` | ✅ | End state rendered immediately |
| Focus traps + restore | ✅ | All six modal surfaces |
| Keyboard: Escape closes | ✅ | Every overlay |
| `:focus-visible` rings | ✅ | Never the browser default |
| 44px hit targets | ✅ | On the storefront |
| Responsive | ✅ | Verified 360 / 768 / 1440 in both locales, no overflow |
| SEO metadata + hreflang | ✅ | Per page, both locales |
| JSON-LD | ✅ | `Product` on the PDP, `ItemList` on home |
| Sitemap + robots | ✅ | `/admin` and `/studio` disallowed |
| Sanity schemas + GROQ | ✅ | 5 document types, projections into domain types |
| Sanity Studio | ✅ | `/studio` |
| Seed script | ✅ | `npm run sanity:seed` |
| Server-side validation | ✅ | Actions validate independently of the client |
| **Authentication** | ✅ | scrypt passwords, signed 8-hour session cookie (httpOnly, sameSite), `proxy.ts` gate on `/admin` and `/studio`, per-module permission check on every page, and `assertPermission` on all 15 mutating actions |
| Roles | ✅ | Owner · Admin · Editor (content only) · Fulfilment (orders only). Nav is filtered per role and direct URLs are denied |
| Demo mode | ✅ | Two footer buttons — one opens the dashboard with nothing to type, one goes to the sign-in page, which offers the three demo accounts as quick-fill. Off unless `NEXT_PUBLIC_DEMO_MODE` is set; the server action re-checks the flag and only accepts the `DEMO_*` addresses |
| Order tracking | ✅ | `/[locale]/track` — order number plus phone, matched on the last 9 digits so formatting does not matter |
| Transactional email / SMS | 🟡 | `lib/notifications.ts` is called on every order and logs; no provider is wired (see below) |
| Analytics | ⛔ | |
| Tests | ⛔ | |
| Rate limiting | ⛔ | Login and checkout accept unlimited attempts |

---

## 4. What is missing — recommended order

### Blocks launch

1. **Card and wallet payment.**
   Cash on delivery works end to end. Card and wallet record
   `paymentStatus: "pending"` and stop there — they need Paymob credentials
   and a webhook route that verifies the HMAC before marking an order paid.
   This is the only remaining blocker for taking money online.

### Needed shortly after

2. **A notification provider.** `lib/notifications.ts` is already called on
   every order and logs what it *would* send. Implement `send()` against
   Resend/Postmark for email and Twilio or a local aggregator for SMS — SMS
   matters more than email in Egypt.

3. **Customer accounts.** Guest checkout and order tracking both work; accounts
   would add saved addresses and an order history.

4. **Coupon redemption tracking.** `used` never increments, and there are no
   usage limits, minimum-order rules or expiry dates. A coupon today is
   effectively unlimited and eternal.

5. **Customer reviews.** Ratings on the PDP are static numbers. Real reviews
   should feed `rating` / `reviews` and flow into the existing moderation
   queue, which is already built for it.

6. **Image reordering and alt text.** Upload works, but the first uploaded
   image is always the hero and alt text defaults to the product name.

### Worth having

10. **The four missing nav destinations.** Journal, Gifts, Discovery sets and the
    scent quiz are linked from the header and all land on `/collection`.
12. **Search index.** The current search fetches the whole catalogue and filters
    client-side. Fine at 6 products; replace before ~100.
13. **Cookie consent and WhatsApp contact.** Both are in the DESIGN.md chrome
    spec and neither is built. WhatsApp is close to expected for Egyptian retail.
14. **Gulf shipping.** The brief says the house ships "across Egypt and the
    Gulf", but zones, currency and the phone format are Egypt-only.
15. **Analytics, abandoned-cart recovery, and tests.**

---

## 5. Deliberately out of scope

Listed by the handoff itself under *"Not in this design — still to be
decided"*, so their absence is intended rather than an oversight: page-builder
content management for the home page's section order, separate EN/AR fields for
testimonials, tax rules and refunds.

---

## 6. Notes on the live Sanity connection

The dataset returns documents only to authenticated requests, so the read
client attaches the token. Every read runs in a Server Component or a server
action, so it never reaches the browser — but it does mean the Sanity CDN is
bypassed, and Next's `revalidate` + tags are the only cache. That is also what
makes a dashboard write visible immediately instead of up to a minute later.

`scripts/sanity-seed.mjs` is safe to re-run: every document uses a
deterministic id and `createOrReplace`.

---

## 7. Authentication

Sessions are a signed JWT in an httpOnly cookie (`jose`, HS256, 8 hours).
Passwords are scrypt with a per-user salt, compared in constant time, and a
sign-in attempt for an unknown address still runs a hash so the response time
does not reveal whether the account exists.

Three layers, because a cookie proves who you are and nothing more:

1. `proxy.ts` keeps anonymous traffic off `/admin` and `/studio` entirely, and
   **fails closed** if `AUTH_SECRET` is unset.
2. Every dashboard page calls `requirePermission`, so a direct URL to a module
   your role cannot open lands on `/admin/denied`.
3. Every mutating server action calls `assertPermission`, so a hand-crafted
   request cannot write what the UI would not let you write.

```bash
# one-time
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"  # AUTH_SECRET
npm run admin:create -- you@example.com "a-long-password" owner "Your Name"
```

With Sanity configured this writes a `user` document; without it, it prints the
`ADMIN_*` env lines for a single bootstrap owner.

This is a deliberately small, auditable implementation rather than Auth.js —
there is no OAuth requirement here. Swapping in Auth.js later only touches
`lib/auth/*`; the permission checks above are independent of it.

## 8. Payment

| Method | State |
| --- | --- |
| Cash on delivery | Complete. Orders land as `paymentStatus: "due"` |
| Card / wallet | Order is created as `"pending"` and stops there |

Nothing is ever marked `"paid"` by the checkout — only a verified gateway
webhook should do that. To finish card and wallet:

1. Add Paymob credentials to `.env.local`.
2. Create `app/api/webhooks/paymob/route.ts`, verify the HMAC, and patch the
   order's `paymentStatus`.
3. Redirect card and wallet checkouts to the gateway instead of straight to
   the confirmation page.

The order model, statuses and the COD path are already in place for it.
