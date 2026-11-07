# Jibli.tn — Improvement Plan

**Written:** 2026-11-07, after a full review, test and fix pass. Companion to [system-design.md](system-design.md).

This plan covers what is still missing or weak in the code as it stands. It is ordered by risk:
first what blocks a public launch, then what makes the codebase sustainable, then product growth.
Effort is a rough single-developer estimate: **S** ≤ 1 day, **M** 2–5 days, **L** 1–3 weeks.

The long-range vision in `docs/functionnal/roadmap.md` (payments, mobile apps, expansion) is still
valid. This plan is the concrete engineering path to get there.

---

## Where things stand

Fixed in the review pass (details in the git history once committed):

- The Next.js API had broken `:id` routes and a broken session lifecycle (logout, 15-minute
  expiry loop, fake password change). It also leaked emails, phones and login state.
- On the pages: a crashing search page, an empty dashboard, a homepage frozen at build time and fake
  "verified" badges and ratings. No first message could be sent to a new contact.
- Hardening: input validation, field whitelists, rate limiting, security headers, length limits,
  search indexes, French 404/error pages, form accessibility.
- Vulnerable dependencies (critical `next`, high `mongoose` and others) updated. `node_modules`
  removed from git tracking. A real local `JWT_SECRET`.
- Tests: a new Playwright suite of API and browser tests against the real Next app.

What remains is below.

---

## P0 — Before any public launch

| # | Item | Why | Effort |
|---|---|---|---|
| P0-1 | **Account deletion** (`DELETE /api/users/me` + button in profile) | The privacy page promises a right to deletion; the Next API has no way to do it. Delete or anonymise the user's trips, requests, messages and sessions. | S |
| P0-2 | **Email verification** | `/securite` states that emails are systematically verified; nothing verifies them, and `isEmailVerified` is never set. Send a signed link at registration (needs an email provider such as Resend, Postmark or SES). Either ship it or remove the claim. | M |
| P0-3 | **Password reset** ("mot de passe oublié") | Users who forget their password are locked out for good. Reuses the email provider from P0-2; single-use hashed token, 30 min expiry, revoke all sessions on reset. | M |
| P0-4 | **Report a listing / a user** | The footer mentions "Signalement" but there is no way to report anything. Needed for a marketplace that carries parcels across borders (illegal goods). Minimal version: report button → `reports` collection → admin email. | M |
| P0-5 | **Continuous integration** | Nothing runs the tests automatically. Add a GitHub Actions workflow: `npm ci`, `npx playwright install --with-deps chromium`, `npm test`, `npm run test:e2e`, on every pull request. | S |
| P0-6 | **Hosting decision and production config** | The rate limiter is in memory, so it only works on one long-running instance. Choose either a single Node host (Render, Railway, Fly, a VPS: works as-is) or serverless (Vercel: needs P2-9). Set `MONGO_URI` (Atlas), a private `JWT_SECRET`, HTTPS and backups. | M |
| P0-7 | **Legal text review** | The terms are dated January 2024 and were written for the old site. Have them checked (customs liability, prohibited items, data retention). | S (+ legal) |

---

## P1 — Make the codebase sustainable

| # | Item | Why | Effort |
|---|---|---|---|
| P1-1 | **Retire the legacy Express app** | `server.js`, `backend/routes`, `backend/controllers`, `backend/middleware(s)`, `pages/`, `js/` and `css/` duplicate the Next app. They still carry old bugs (e.g. logout doesn't revoke the refresh cookie), and the 97 Jest tests guard this dead code rather than the live one. Steps: (1) port the remaining useful integration cases to `tests/e2e/api.spec.js`; (2) delete the legacy code, `body-parser`, `cors`, `cookie-parser`, `express`, `express-rate-limit`, `supertest`; (3) make `npm start` run `next start`. | M |
| P1-2 | **Revisit the monorepo plan** | `nextjs_monorepo_migration_plan.md` proposes Turborepo with `apps/` and `packages/`. With one app and one developer that adds tooling cost for no gain. Recommendation: stay a single Next app, and keep models in `backend/models` (or move them to `lib/db`). Revisit when a second app (mobile backend, admin) exists. | S (decision) |
| P1-3 | **Linting and formatting** | There is no linter. Add ESLint (flat config with `eslint-config-next`) and Prettier, wired into CI. This would have caught the missing `Link` import that crashed search. | S |
| P1-4 | **TypeScript, gradually** | Most bugs found in review were shape mismatches (`_id` vs `id`, async `params`, missing imports). Enable `allowJs` + `checkJs` first, then convert `lib/` and the API routes. | L |
| P1-5 | **Server-side session for pages** | The navbar decides "logged in" from `localStorage`, so it can briefly show the wrong state. Read the session cookie in the root layout (`cookies()`) and pass the user to the navbar. The `jibli_logged_in` flag can then go. | M |
| P1-6 | **Unify data access** | Server pages query models directly while client pages go through the API, so the two copies of the "what is public" logic must stay in sync (e.g. the upcoming-trips filter lives in both `app/page.js` and `/api/trips`). Move queries into `lib/queries/*` used by both. | M |
| P1-7 | **Test Next route handlers in Jest** | E2E covers the API but is slow (build + browser). Add fast handler-level tests (e.g. `next-test-api-route-handler`) for validation and authorisation rules. | M |
| P1-8 | **Clean the repository root** | About 20 stray `test_output*.txt` / `*_out.txt` files, an old `coverage/`, `playwright-report/` and `test-results/` sit in the root (ignored by git but confusing). Delete them. | S |
| P1-9 | **Playwright browser version** | This machine has Chromium build 1234 but Playwright 1.58 needs 1208, so the default config can't launch. Run `npx playwright install chromium` once (CI does it in P0-5). | S |
| P1-10 | **Remaining dependency advisories** | 19 low/moderate advisories remain, all inside Jest 30's own dependency tree, where npm offers no non-breaking fix. Re-check on each Jest release; they don't reach production. | S (recurring) |
| P1-11 | **Mongoose is pinned to `~9.9.5`** | Mongoose ≥ 9.11 pulls MongoDB driver ≥ 7.7, whose handshake fails inside Jest ("Missing required sub-document 'driver'"); the Jest suites then hang. 9.9.5 (driver 7.5) is advisory-free and works. Lift the pin once a driver release fixes it, or once the Jest DB tests are replaced (P1-1/P1-7). | S |

---

## P2 — Product improvements

Ordered by expected user value.

| # | Item | Notes | Effort |
|---|---|---|---|
| P2-1 | **Edit and close listings from the dashboard** | `PUT /api/trips/:id` and `/api/requests/:id` already exist, including `status`; only the UI is missing. Let travellers mark a trip completed or cancelled. | S |
| P2-2 | **Unread badge and notifications** | `Message.read` is tracked but never shown. Add an unread count in the navbar and an email digest for messages unread after N hours. | M |
| P2-3 | **Real-time messaging** | The open thread is polled every 3 s. Server-Sent Events are enough here (one-way push); WebSockets only if typing indicators are wanted. Needs a long-running host (see P0-6). | M |
| P2-4 | **Reviews after an exchange** | The UI shows ratings and `User.reviews` exists, but nothing creates a review. Model an "exchange" (trip + request + both users, confirmed by both), allow one review per side after completion, and move reviews to their own collection. This is the core of trust on the platform. | L |
| P2-5 | **Matching suggestions** | On a trip, show open requests going to the same destination; on a request, show upcoming trips. Reuses the existing filters. | M |
| P2-6 | **Better search** | Normalise cities (a list of airports/cities with autocomplete) instead of free text; add a date range; keep filters in the URL so results can be shared and survive reload; also run requests through `from`. Add a MongoDB text index or Atlas Search when volume grows. | M |
| P2-7 | **Avatar and listing photos** | Avatars are typed in as URLs via `prompt()`. Upload to object storage (S3, R2, Cloudinary) with size and type checks, and serve through `next/image`. | M |
| P2-8 | **Favourites** | The "Sauvegarder" buttons were removed because they did nothing. Add a `favorites` collection and a dashboard tab if users ask for it. | S |
| P2-9 | **Multi-language (FR / AR / EN)** | The non-functional language switcher was removed. Use `next-intl` with locale routes, extract all strings, and support right-to-left for Arabic. | L |
| P2-10 | **SEO** | Add `generateMetadata` on trip, request and profile pages (title "Paris → Tunis le 12 mars"), a `sitemap.xml`, `robots.txt` and Open Graph images, so shared links look good on WhatsApp and Facebook (the main sharing channels for the audience). | S |
| P2-11 | **Phone and identity verification** | The profile shows these as "Bientôt disponible". Phone: SMS OTP (e.g. Twilio Verify). Identity: a KYC provider. The badges on public pages already read the real flags. | L |

---

## P3 — Operations and scale

| # | Item | Notes | Effort |
|---|---|---|---|
| P3-1 | **Structured logging and error tracking** | Replace `console.error` with a logger (pino) and add error monitoring (Sentry). Monitor `/api/health` from an uptime service. | S |
| P3-2 | **Shared rate-limit store** | Move `lib/rateLimit.js` counters to Redis (Upstash works with serverless) once there is more than one instance. | S |
| P3-3 | **Stricter CSP** | The CSP allows `'unsafe-inline'` scripts because Next emits inline scripts. Switch to per-request nonces generated in `proxy.js`. | M |
| P3-4 | **Refresh-token reuse detection** | Rotation deletes old tokens, so a stolen-and-replayed token is just rejected rather than detected. Keep rotated tokens marked as used for their lifetime and revoke the whole family on reuse (handle the multi-tab race with a short grace period). | M |
| P3-5 | **Backups and data retention** | Automated Atlas backups, restore drill, and a retention rule for old messages and closed listings. | S |
| P3-6 | **Performance** | Use cursor pagination for long lists, `lean()` on API reads, and cache `/api/stats`. Not needed until there is real traffic. | M |

---

## Suggested sequence

1. **Sprint 1 (launch blockers, low effort):** P0-5 CI, P1-3 lint, P0-1 account deletion, P2-1 dashboard edit, P2-10 SEO, P1-8/P1-9 clean-up.
2. **Sprint 2 (trust):** P0-2 email verification, P0-3 password reset, P0-4 reporting, P0-7 legal review.
3. **Sprint 3 (consolidate):** P1-1 retire legacy, P1-5 server session, P1-6 shared queries, P0-6 deploy.
4. **Then (growth):** P2-2 notifications → P2-4 reviews → P2-5 matching → P2-3 real time → P2-9 languages.

Each item should land with tests: a Playwright browser test for user-visible flows and an
`api.spec.js` case for each API rule, as the current suite does.
