# FitConnect — Technical Documentation

Personal Trainer Booking Platform · Next.js + Supabase

This document is written for a developer picking up this codebase with no prior context. It covers what the system does, how it's built, and what still needs work.

---

## 1. Project Overview & Purpose

FitConnect is a booking platform for a **single personal training studio** — not a multi-vendor marketplace. It has three user-facing surfaces:

1. **Public site** — anyone can browse trainers, their specialties, services, and pricing without logging in.
2. **Client booking flow** — a logged-in client books a session with a trainer: pick a service, pick an open time slot, pay by card, get a confirmation email. Clients can also manage their own bookings afterward (cancel, or reschedule once).
3. **Admin dashboard** — studio staff manage trainers, services, availability, bookings, clients, and payments, including booking sessions on a client's behalf (e.g. phone/walk-in bookings) and recording non-card payments (cash, bank transfer).

Trainers do **not** have their own accounts or login — they are data records managed entirely by admins, not authenticated users.

---

## 2. Technologies & Tools

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (token-based theme via CSS variables in `globals.css`, not a `tailwind.config.ts`) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password), with a `profiles` table extending `auth.users` |
| File storage | Supabase Storage (trainer profile photos, public bucket `trainer-photos`) |
| Email | Resend (booking confirmation emails), sent from `lib/email/` |
| Hosting | Vercel |
| Fonts | Bebas Neue (display/headings), IBM Plex Sans (body), IBM Plex Mono (data/timestamps/prices) |

**No ORM.** All database access goes through the Supabase JS client directly (`@supabase/supabase-js`, `@supabase/ssr`) — not Prisma. 

---

## 3. Project Structure

```
app/
├── admin/                    # Admin dashboard — protected, see §9
│   ├── layout.tsx             # Auth/role guard + sidebar shell
│   ├── page.tsx                # Overview: stats, today's bookings, trainer roster
│   ├── trainers/               # List, create, edit (photo/specialties/services)
│   ├── bookings/               # List, filter, cancel/refund, mark completed/no-show,
│   │                            # "Book a session" on a client's behalf
│   ├── payments/               # Awaiting-payment queue + payment history
│   ├── availability/           # Add/block/delete trainer time slots
│   └── clients/                # View registered clients
│
├── api/
│   ├── admin/                  # All admin mutation endpoints — see §8
│   └── schedule/today/         # Public: powers the homepage's live schedule board
│
├── auth/signout/               # Signs the current user out (redirects after)
│
├── booking/[trainerId]/        # Client-facing booking flow (see §7)
│   ├── page.tsx
│   └── actions.ts                # Server Action that creates the booking + payment
│
├── dashboard/                   # Client dashboard — protected, client-only
│   ├── layout.tsx                 # Auth guard + client shell
│   ├── page.tsx                    # Overview: upcoming bookings, sessions, saved trainers
│   ├── bookings/                   # View bookings; cancel or reschedule (once — see §7)
│   ├── payments/                   # Payment history
│   └── profile/                    # Edit name, email, phone
│
├── login/                         # Login Page
├── trainers/                    # Public trainer listing + /trainers/[id] profile
├── layout.tsx, nav.tsx           # Root layout + site navbar
├── page.tsx                      # Homepage
└── sitemap.ts                    # Auto-generated sitemap.xml (trainers + static pages)

components/
├── admin/                       # Admin-only UI: tables, forms, modals
├── home/                         # Hero, today's board, programs, trainer preview
├── layout/                       # Shared chrome
├── trainers/                     # trainer-card, trainer-avatar (shared image/initials
│                                   fallback), trainers-browser (listing + filters)
├── booking-flow.tsx               # The multi-step booking UI (service → time → pay)
├── reschedule-flow.tsx            # Client-facing reschedule UI (one-time use — see §7)
├── site-header.tsx, site-footer.tsx
└── auth-tabs.tsx, book-cta.tsx

lib/
├── auth/, auth.ts, get-session.ts   # Session/auth logic 
├── supabase/
│   ├── server.ts                 # Server Component / Route Handler client (anon key, RLS enforced)
│   ├── client.ts                  # Client Component client (anon key, RLS enforced)
│   └── admin.ts                    # Service-role client — BYPASSES RLS. Server-only,
│                                      used exclusively by /api/admin/* routes.
├── queries/                       # One file per resource (trainers, services,
│                                      availability, admin, bookings, etc.) — all Supabase
│                                      reads/writes are centralized here, not inline in pages.
├── email/                          # Resend integration — booking confirmation emails
├── luhn.ts                         # Card number/expiry validation (simulated payments — see §10)
├── utils.ts                        # formatTime() and other small helpers
├── types.ts                        # Shared TypeScript types
└── fonts.ts                        # next/font setup for the three custom fonts
```

---

## 4. Setup & Installation

```bash
git clone https://github.com/AbdalazizHweidi/Personal-Trainers-Scheduling-System
cd fitconnect
npm install
```

Create `.env.local` (see §5 for values), then:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

**Database setup**, if starting from scratch on a new Supabase project:
1. Run the table creation SQL for all seven tables (see §6) in the Supabase SQL editor, in dependency order: `profiles` → `trainers` → `services` / `availability_slots` → `bookings` → `payments` / `reviews`.
2. Create the `is_admin()` helper function and all RLS policies (ask the team for the current `.sql` policy file — this was built incrementally over the project and should be kept as a single source of truth, ideally checked into the repo under something like `supabase/policies.sql` if it isn't already).
3. Create the `sync_slot_status()` trigger function and attach it to `bookings` (see §10).
4. Create the `trainer-photos` storage bucket (public) and its two policies (admin upload, public read).

---

## 5. Environment Variables

```bash
# Public — safe to expose to the browser
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# Server-only — NEVER prefix with NEXT_PUBLIC_, never expose to the client.
# Bypasses Row Level Security entirely. Used only inside app/api/admin/*.
SUPABASE_SERVICE_ROLE_KEY=
```

Both Supabase keys come from Supabase → Project Settings → API. Double-check you copy the **`service_role`** key (marked "secret") and not the `anon` key by mistake — they're both JWTs and easy to confuse.

`RESEND_API_KEY` comes from the Resend dashboard; `EMAIL_FROM` is the sender address configured/verified there (e.g. `bookings@yourdomain.com`).

On Vercel: all of the above must be added under Project Settings → Environment Variables, separately from `.env.local` — adding a var locally does not add it to deployments, and adding it in Vercel after a deploy already ran requires a redeploy to take effect.

---

## 6. Database Structure

Seven tables, all in the `public` schema. Every table except `profiles` has a `deleted_at timestamptz` column — **this project uses soft deletes exclusively.** Any query against these tables must include `.is("deleted_at", null)`, or deleted records will reappear.

### `profiles`
Extends Supabase Auth. `id` is the same UUID as `auth.users.id` (linked by FK). No `deleted_at` — this table does not soft-delete.
| Column | Notes |
|---|---|
| `role` | `'client'` \| `'admin'` — no `'trainer'` role, trainers don't log in |

### `trainers`
Standalone entity, **not** linked to `profiles`/`auth.users` — created and edited only via the admin dashboard.
| Column | Notes |
|---|---|
| `specialties` | `text[]` — rendered as tags throughout the UI |
| `avg_rating` | Currently set manually by an admin at creation/edit time. **Not** computed from `reviews` — see §12. |
| `photo_url` | Public URL from the `trainer-photos` Supabase Storage bucket |

### `services`
Belongs to one trainer. `type` is constrained to `1-on-1` / `group` / `online`.

### `availability_slots`
One row per bookable time slot for a trainer. `status`: `open` / `blocked` / `booked`. The admin availability form checks for conflicts **before insert** — both exact duplicates (same trainer, date, and start time) and partial time-range overlaps are rejected.

### `bookings`
The central table — links a client, trainer, service, and slot.
| Column | Notes |
|---|---|
| `status` | `pending`, `confirmed`, `completed`, `cancelled`, `cancelled_by_client`, `cancelled_by_trainer`, `no_show`, `rescheduled` |
| `slot_id` | Nullable, `ON DELETE SET NULL` |
| `reschedule_count` | Tracks how many times a booking has been rescheduled. Clients are limited to rescheduling a given booking **once** — enforced in the client reschedule flow (see §7). |

### `payments`
| Column | Notes |
|---|---|
| `method` | `cash` / `card_in_person` / `bank_transfer` / `card_online` — **default `card_online`**, so the client-facing checkout (real card entry) doesn't need to set this explicitly; admin-recorded payments (cash, etc.) set it explicitly. |
| `status` | Only `success` / `failed` — **no `pending` state.** A booking awaiting payment has *no row in `payments` at all* yet; the booking's own `status = 'pending'` represents that instead. |
| `refunded` | Boolean, separate from `status` — a refunded payment still has `status = 'success'`, just `refunded = true` |

### `reviews`
Schema exists (rating 1–5, comment, linked to a completed booking). **No UI writes to this table yet** — confirm with the team whether the review-submission flow was built before relying on `reviews` having real data.

### Entity relationships (summary)
```
profiles ──< bookings >── trainers ──< services
                │                   └< availability_slots
                ├──< payments
                └──< reviews
```

---

## 7. Main Features & Workflows

### Public browsing (no login)
Homepage → trainer listing (filterable by specialty) → trainer profile (bio, certifications, this week's availability, services). All served via the anon-key Supabase client; RLS policies allow public `SELECT` on active/non-deleted `trainers`, `services`, and `availability_slots`.

### Client booking flow (`app/booking/[trainerId]/`)
A 4-step client component (`booking-flow.tsx`): **choose service → pick date/time → enter card details → confirmation.**

- Card input is validated client-side (Luhn algorithm check, expiry validation in `lib/luhn.ts`) — **this is a simulated payment, not a real payment processor integration.** No Stripe or similar; only the last 4 digits of the card are persisted.
- Submission goes through a **Next.js Server Action** (`app/booking/[trainerId]/actions.ts`, `submitBooking`), not a REST API route — this is a deliberate pattern difference from the admin side (see §10).
- On success: creates the `bookings` row, creates the matching `payments` row (`method` defaults to `card_online`), marks the slot `booked` (via the database trigger — see §10), sends a confirmation email through Resend, and redirects to a success screen.

### Client dashboard (`app/dashboard/`)
Protected, client-only. Covers:
- **Overview** — upcoming bookings, session count, saved/preferred trainers.
- **Bookings** — view all bookings; **cancel**, or **reschedule** (`reschedule-flow.tsx`). Reschedule is limited to **once per booking** — subsequent reschedule attempts on the same booking are blocked, tracked via `bookings.reschedule_count`.
- **Payments** — payment history for the logged-in client.
- **Profile** — edit name, email, phone.

### Admin dashboard (`app/admin/`)
Gated by `getCurrentUser()` returning `role: 'admin'` (§9). All data access goes through `lib/supabase/admin.ts`'s service-role client, which bypasses RLS — the *route-level* `requireAdmin()` check is what actually protects these endpoints, not RLS.

- **Trainers** — create/edit (name, photo upload, specialties as tags, certifications, bio, starting rating), activate/deactivate, manage each trainer's services inline (add/edit/deactivate/delete).
- **Availability** — add slots (rejecting both exact duplicates and overlapping time ranges), block/reopen, soft-delete.
- **Bookings** — filter by status (including a grouped "cancelled" filter covering all three cancellation reasons), cancel with an optional refund prompt, mark `completed`/`no_show` (only appears once the session's start time has passed and status is `confirmed` — enforced both in the UI and re-checked server-side in the API route).
- **Book a session (on behalf of a client)** — a separate flow from the client-facing one: admin picks an existing client (search by name/email), then a trainer, then a service and open slot. Creates the booking as `status: 'pending'` with **no payment row** — intentionally left unpaid.
- **Payments** — "Awaiting payment" queue lists every `pending` booking with no payment row yet; recording a payment there inserts the `payments` row (method chosen explicitly: cash / card in person / bank transfer) and flips the booking to `confirmed`. A payment history table shows everything recorded, including refunded status.
- **Clients** — read-only list of registered client accounts.

---

## 8. API Routes / Endpoints

Almost everything under `/api/` is **admin-only**, gated by `requireAdmin()` (checks `getCurrentUser().role === 'admin'`, returns `401` otherwise). The client-facing booking flow deliberately uses a **Server Action** instead of a REST route (see §10), so it won't appear in a typical API route listing, but it's the equivalent of a `POST`. Client-side reschedule/cancel from the dashboard likely follows the same Server Action pattern — confirm with whoever built `app/dashboard/bookings/` if you need the exact entry point.

| Route | Method | Purpose |
|---|---|---|
| `/api/schedule/today` | GET | Public — powers the homepage's live schedule board polling |
| `/api/admin/trainers` | POST | Create trainer (multipart — handles photo upload to Storage) |
| `/api/admin/trainers/[id]` | PATCH | Edit trainer (multipart — name, specialties, rating, bio, certs, optional new photo, active toggle) |
| `/api/admin/trainers/[id]/services` | GET | Active services for a given trainer (used by the admin booking-creation form) |
| `/api/admin/trainers/[id]/open-slots` | GET | Open slots for a given trainer (same use case) |
| `/api/admin/services` | POST | Create a service for a trainer |
| `/api/admin/services/[id]` | PATCH, DELETE | Edit / soft-delete a service |
| `/api/admin/availability` | POST | Add a slot (rejects exact duplicates and overlapping ranges) |
| `/api/admin/availability/[id]` | PATCH, DELETE | Block/reopen a slot / soft-delete it |
| `/api/admin/bookings` | POST | Admin creates a booking on a client's behalf (`status: pending`, no payment) |
| `/api/admin/bookings/[id]/cancel` | POST | Cancel a booking; body includes `refund: boolean` |
| `/api/admin/bookings/[id]/outcome` | POST | Mark `completed` or `no_show`; rejects if not `confirmed` or session hasn't happened yet |
| `/api/admin/payments` | POST | Record a payment for a `pending` booking; flips booking to `confirmed` |

---

## 9. Authentication & Authorization Flow

**Auth structure:**
- `app/auth/signout/` handles signing the user out (clears the Supabase session, redirects). **Sign in and sign up are not under `app/auth/`** — they live elsewhere in the app (likely `app/login/`, using `components/auth-tabs.tsx` to toggle between the two forms). Confirm the exact route with the team if you need to link to it directly.
- Session refresh happens on every request via `middleware.ts` calling `updateSession()` (in `lib/supabase/proxy.ts`), which keeps the Supabase auth cookie current for Server Components.

**Client-side/public auth** (real, via Supabase Auth):
- `getCurrentUser()` calls `supabase.auth.getUser()`, then joins to the `profiles` table by `id` to get `full_name`, `email`, `role`. Returns `null` if not logged in or the profile lookup fails.
- Row Level Security enforces access at the database level for anything queried with the anon-key client: public tables are openly readable; `bookings`/`payments`/`profiles` are restricted to the owning user (`auth.uid() = client_id` / `= id`) or an admin, via an `is_admin()` SQL helper function that checks the caller's own `profiles.role`.

**Admin dashboard auth:**
- `app/admin/layout.tsx` calls `getCurrentUser()` server-side; if the result is `null` or `role !== 'admin'`, it redirects to the login page.
- **Important:** every `/api/admin/*` route independently calls `requireAdmin()` — the layout guard alone does **not** protect the API routes, since API routes can be hit directly without rendering the layout. Both layers exist and both matter.
- Admin routes then use the **service-role Supabase client** (`lib/supabase/admin.ts`), which bypasses RLS entirely. This means the `requireAdmin()` check is the *only* thing standing between an unauthenticated request and full read/write access to every table via these routes — there is no RLS safety net once a request reaches an admin route. Treat any bug in `requireAdmin()` or `getCurrentUser()` as a critical security issue, not a minor one.

**Client dashboard auth:** `app/dashboard/layout.tsx` follows the same guard pattern as admin, but requires only a valid logged-in session (any role), not specifically `role: 'admin'`.

---

## 10. Key Technical Decisions

- **Soft deletes everywhere except `profiles`.** Every query must filter `deleted_at IS NULL`. This was a deliberate early decision; it means "deletion" in the admin UI never issues a real `DELETE`, only an `UPDATE ... SET deleted_at = now()`.

- **Two different client-vs-admin write patterns, on purpose:**
  - Client-facing booking creation uses a **Server Action** (`submitBooking`) — appropriate since it's form-like, single-purpose, and called from one place.
  - Admin mutations use **REST API routes** under `/api/admin/*` — chosen because the admin dashboard has many independent CRUD surfaces (trainers, services, slots, bookings, payments) that benefit from a consistent request/response shape and independent `requireAdmin()` gating per endpoint, rather than one large server-action file.

- **Payments are simulated, not real.** Card numbers are Luhn-validated client-side for realism but never sent to a real processor — only the last 4 digits are persisted. There is no Stripe/PayPal/etc. integration. This was an explicit scope decision to keep the project buildable in the timeframe, not an oversight — but it should be stated clearly in any project presentation so it isn't mistaken for a real payment system.

- **Admin routes trade RLS for a service-role client.** Rather than trying to make RLS policies expressive enough for every admin scenario, admin routes bypass RLS entirely and rely solely on the `requireAdmin()` check. This is simpler to reason about but means RLS bugs elsewhere in the schema won't protect these routes — the API route guard is doing all the work.

- **One reschedule per booking, enforced via `reschedule_count`.** Rather than allowing unlimited reschedules (which could be used to indefinitely delay a session) or blocking rescheduling entirely, the client flow allows exactly one reschedule per booking, checked against this counter before allowing the action.

---

## 11. Running, Testing, and Deploying

**Local development:**
```bash
npm run dev
```

**Production build (also what Vercel runs):**
```bash
npm run build
```
Run this locally before pushing if a deploy is failing — it reproduces the exact build Vercel performs, including the TypeScript/ESLint checks that `next build` enforces more strictly than dev mode does.

**Testing:** No automated test suite (unit or integration) exists in this project as of this document. All verification has been manual (dev server + Supabase table editor + direct API calls). Adding tests is listed under Future Improvements below.

**Deployment:** Vercel, connected to the GitHub repo for automatic deploys on push. Environment variables must be set in the Vercel project dashboard separately from local `.env.local` (§5) — this has been a recurring source of deploy failures during development, always check this first if a deploy fails but `npm run build` succeeds locally.

---

## 12. Known Issues & Future Improvements

**Known issues:**
- `avg_rating` on `trainers` is a manually-entered admin field, not computed from actual `reviews` data. The `reviews` table has no write path yet at all.
- Old trainer photos are never deleted from Supabase Storage when replaced during an edit — storage usage will grow over time with orphaned files.
- Auth/session logic appears split across `lib/auth.ts`, `lib/auth/`, and `lib/get-session.ts` — worth a consolidation pass to confirm there's exactly one source of truth for "who's logged in," to avoid two places checking session state in subtly different ways.

**Suggested next steps:**
- Add a real payment processor integration (Stripe or similar) if this moves beyond a class project.
- Build the review-writing flow so `avg_rating` reflects real client feedback instead of an admin-set number.
- Add automated tests, at minimum around the booking creation flow (client and admin paths), the reschedule-once rule, and the RLS policies, since those are the highest-consequence areas for silent bugs.
- Add cleanup logic (or a scheduled job) to remove orphaned trainer photos from Supabase Storage after a replacement upload.