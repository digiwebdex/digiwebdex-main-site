# Full Migration: Lovable Cloud → VPS Self-Hosted

**Goal:** App + database + auth + files + cron jobs run entirely from VPS (`digiwebdex.com`). Zero Supabase dependency in production.

**Decisions locked in:**
- Auth: force password reset for all 29 users (Resend email link → `/reset-password`)
- Edge functions: port all 20 to Express routes + `node-cron` jobs
- Files: local disk at `/var/www/digiwebdex/backend/uploads/`, served by nginx
- Frontend: full rewrite — every `supabase.from(...)` / `supabase.auth.*` / `supabase.functions.invoke(...)` replaced with `/api/*` calls

---

## Phase 1 — Data export from Lovable Cloud → VPS Postgres

1. Export every `public.*` table to CSV via psql (`COPY ... TO STDOUT`) into `/mnt/documents/migration-export/`.
2. Export `auth.users` (id, email, raw_user_meta_data, created_at) to a separate CSV — needed to seed `users` table on VPS with `password_hash = NULL` (forces reset on first login).
3. Download storage bucket files (`payment-proofs`, `ticket-attachments`, `reseller-logos`, `invoices`) via Supabase Storage API → tarball.
4. Run the existing `migration/database/schema.sql + enums.sql + functions.sql + triggers.sql + indexes.sql + constraints.sql` against the local Postgres on VPS to recreate structure.
5. Generate a `vps_data_import.sql` that `\COPY`s every CSV into the matching table in dependency order.
6. **You run on VPS:** upload CSVs + tarball, `psql < vps_data_import.sql`, `tar -xzf storage.tgz -C /var/www/digiwebdex/backend/uploads/`.
7. Verify: `SELECT count(*) FROM users, invoices, orders, profiles` — must match Cloud numbers (29/28/38/29).

## Phase 2 — Express backend feature-complete

Audit `migration/backend/src/routes/*.js` against the 70+ tables and 20 edge functions. Add what's missing:

- **Auth routes** (`/api/auth/*`): register, login (bcrypt + JWT), logout, request-reset, reset-password, me, change-password. Issue HttpOnly cookie + bearer token.
- **Generic data routes** (`/api/data/:table`): wrap PostgREST-style filtering (`?select=`, `?eq.column=`, `?order=`) so the frontend shim can map `supabase.from(t).select().eq(...)` 1:1.
- **Storage routes** (`/api/storage/:bucket/*`): signed-URL emulation using JWT, write to `/uploads/<bucket>/<path>`, nginx serves `/uploads/*` directly.
- **Function endpoints** ported from `supabase/functions/`:
  - `send-email` → Resend via existing `RESEND_API_KEY`
  - `send-sms`, `send-otp`, `verify-otp` → BulkSMSBD
  - `messenger-webhook`, `fb-capi`, `google-capi`, `ga4-proxy`
  - `onboarding-chat` → Lovable AI Gateway or direct Gemini key (you'll need to add `GEMINI_API_KEY` since `LOVABLE_API_KEY` won't work off-platform)
  - `whois-lookup`, `daily-csv-backup`, `database-backup`, `secure-webhook-handler`, `sitemap-xml`, `robots-txt`, `health-check`, `admin-create-user`, `rate-limiter`
- **Cron jobs** in `migration/backend/src/cron.js` using `node-cron`: `affiliate-commission-cron`, `analytics-aggregation`, `lead-follow-up-cron`, `milestone-reminder-cron`, `proposal-reminder-cron`, `renewal-cron`, `subscription-billing-cron`.
- **DB triggers/functions**: confirm `schema.sql` already includes `handle_new_user`, `auto_generate_invoice`, `update_customer_balance`, `check_order_delete_integrity`, `generate_invoice_number`, `generate_order_number`, `generate_ticket_number`, `generate_proposal_number`, `generate_referral_code`, `has_role`, `has_permission`, `is_admin_or_staff`. Patch any missing.

## Phase 3 — Frontend rewrite

1. Replace `src/integrations/supabase/client.ts` with a new `src/lib/api/client.ts` that exposes a `supabase`-shaped shim wrapping `fetch('/api/*')`. Keeps existing call sites compiling.
2. Repoint every `import { supabase } from "@/integrations/supabase/client"` → `import { supabase } from "@/lib/api/client"` (codemod).
3. Replace `supabase.auth.*` calls with shim equivalents that hit `/api/auth/*` and store JWT.
4. Replace `supabase.functions.invoke('name', ...)` with `fetch('/api/functions/name', ...)`.
5. Replace `supabase.storage.from(b).upload/getPublicUrl` with `/api/storage/*` calls.
6. Update `AuthContext` (already half-migrated in `AuthContextMigrated.tsx`) to be the only auth provider.
7. Update `.env`:
   - Remove `VITE_SUPABASE_*`
   - Add `VITE_API_URL=https://digiwebdex.com/api`, `VITE_WS_URL=wss://digiwebdex.com`

## Phase 4 — Force-reset emails for existing users

1. Backend cron one-shot: for every row in `users` where `password_hash IS NULL`, issue a 7-day password reset token, send Resend email (Bangla + English) with link `https://digiwebdex.com/bn/auth/reset-password?token=...`.
2. Admin endpoint `/api/admin/users/:id/send-reset` to manually re-trigger.
3. Login route returns `must_reset_password: true` if `password_hash IS NULL`, frontend redirects to reset page.

## Phase 5 — Build, deploy, switch DNS-internal routing

1. `npm run build` → upload `dist/` to `/var/www/digiwebdex/frontend/dist/`.
2. `cd /var/www/digiwebdex/migration/backend && npm install && pm2 restart digiwebdex-api` (or docker-compose up -d backend).
3. Confirm nginx `digiwebdex.com` config proxies `/api/` → `127.0.0.1:3002` and `/uploads/` → local files.
4. Smoke-test: login as admin (after password reset), view invoices, create order, upload payment proof, trigger send-email.

## Phase 6 — Decommission Cloud

1. Once you confirm 7 days of stable VPS operation: delete `supabase/functions/*` from the repo, delete `src/integrations/supabase/`, remove `@supabase/supabase-js` from `package.json`.
2. (Optional) ask Lovable support about disabling Cloud for this project — Cloud cannot be uninstalled from an existing project, only disabled for new ones.

---

## Technical notes

- **Passwords:** bcrypt cost 12. JWT HS256, `JWT_SECRET` already in `migration/backend/.env.production`, 7-day expiry.
- **Reset tokens:** stored in new `password_reset_tokens` table (token_hash, user_id, expires_at, used_at). Token sent in email is the raw value; only the SHA-256 hash is stored.
- **CSV import order** (FK dependencies): users → profiles → user_roles → service_categories → services → service_packages → domain_pricing → orders → order_items → invoices → invoice_items → payments → manual_payments → everything else.
- **WebSocket / realtime:** Supabase realtime is not ported. If any page relies on `supabase.channel().on('postgres_changes')`, it switches to polling (5s) on the rewritten client. Flag any such pages during Phase 3.
- **Edge function secrets that move to VPS `.env`:** `RESEND_API_KEY`, `SMS_API_KEY`, `SMS_SENDER_ID`, `META_PAGE_ACCESS_TOKEN`, `META_WEBHOOK_VERIFY_TOKEN`. **New secret needed:** `GEMINI_API_KEY` (Lovable AI Gateway requires `LOVABLE_API_KEY` which only works inside Cloud).
- **Estimated work:** Phases 1–2 ~1 session. Phase 3 (frontend rewrite) is the bulk — 2–3 sessions because of the volume of `supabase.*` call sites. Phases 4–6 ~1 session.

---

## What I need from you before starting

1. **Confirm I should proceed with Phase 1 now** (data export script + VPS import SQL).
2. **Gemini API key**: do you have one already, or should we keep `onboarding-chat` disabled on VPS for now? Get one free at https://aistudio.google.com/app/apikey.
3. **Reset email sender**: confirm `noreply@digiwebdex.com` is verified in Resend (or give me the address to use).
4. **Any pages using Supabase realtime subscriptions** you specifically care about? (admin live updates etc.) — I'll convert to polling otherwise.
