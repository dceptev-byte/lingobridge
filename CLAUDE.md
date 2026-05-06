# CLAUDE.md — Lingobridge Project Context
> This file is read by Claude Code at the start of every session.
> Keep it up to date as the project evolves.

---

## What This Project Is

Lingobridge is a web-first language learning app for the Vietnamese and Hindi-speaking communities.
It teaches Vietnamese speakers Hindi, and Hindi speakers Vietnamese.
It is modelled on Duolingo's engagement loop with gamification, streaks, XP, and a freemium model.

**Live URL:** https://lingobridge.chillfivillage.com (not yet live)
**Staging:**  https://staging.lingobridge.chillfivillage.com (not yet live)
**Local:**    http://localhost:3000

---

## Owner

Solo developer. Building with Claude Code. Decisions are made by the owner — do not make
architectural decisions autonomously. Always propose and wait for approval on anything that:
- Changes the database schema
- Adds a new dependency
- Modifies an API contract
- Touches auth or payment logic

---

## Tech Stack (Do Not Change Without Discussion)

| Layer       | Tool                          |
|-------------|-------------------------------|
| Framework   | Next.js 14 (App Router)       |
| Language    | TypeScript (strict mode)      |
| Styling     | Tailwind CSS                  |
| Auth        | Supabase Auth                 |
| Database    | Supabase PostgreSQL + Prisma  |
| State       | Zustand                       |
| Payments    | Lemon Squeezy                 |
| Email       | Resend                        |
| Analytics   | PostHog                       |
| Deployment  | Vercel                        |

---

## Current Phase

> UPDATE THIS LINE when moving between phases.

**Phase 1 — Foundation** (in progress)

See PLAN.md for the full phase checklist.

---

## Key Decisions & Constraints

### i18n
- The app UI renders entirely in the user's native language (Vietnamese or Hindi)
- English is a "builder/dev mode" only — not a real user language
- All UI strings must use the `t()` function from `lib/i18n/index.ts`
- NEVER hardcode UI strings in components — always use a translation key
- String keys are defined in `lib/i18n/en.ts` (source of truth), then `vi.ts` and `hi.ts`

### Content
- Lesson content is stored as JSON files in `/content/`
- Two language pairs: `vi-hi/` (Vietnamese learning Hindi) and `hi-vi/` (Hindi learning Vietnamese)
- Content is seeded into the database via `prisma/seed.ts`
- Do NOT hardcode lesson content in components

### Auth
- All `(app)` routes require an authenticated Supabase session
- Use `createServerClient` from `@supabase/auth-helpers-nextjs` in Server Components
- Use `createBrowserClient` in Client Components
- Never access `supabase.auth` directly in API routes — use the helper

### Database
- Always use Prisma for DB queries — never raw SQL except in migrations
- Always handle Prisma errors — wrap in try/catch and return typed errors
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client

### Payments
- Free tier: max 5 lessons/day, 20 new flashcards/day, Units 1–4 only
- Premium (Lingobridge Plus): unlimited lessons, offline (future), Unit 5
- Lemon Squeezy is the merchant of record — no business entity required
- Webhook endpoint must verify HMAC signature with LEMONSQUEEZY_WEBHOOK_SECRET — never skip
- Do not store card data — Lemon Squeezy handles all PCI compliance
- Do not hardcode variant IDs — always use `lib/lemonsqueezy/plans.ts`
- Future migration to Stripe: only `lib/lemonsqueezy/` + `/api/lemonsqueezy/` + env vars change

### Styling
- Use Tailwind utility classes only — no custom CSS files unless absolutely necessary
- Follow the colour tokens: indigo (--p), emerald (--g), amber, rose, navy
- Fonts: Baloo 2 (display/headings), Be Vietnam Pro (body), Mukta (Hindi body)
- All interactive elements need hover + focus states

---

## Folder Conventions

| Path | What goes here |
|---|---|
| `app/(auth)/` | Login, signup, OAuth callback — public routes |
| `app/(app)/` | All protected app screens |
| `app/api/` | API Route Handlers only — no UI |
| `components/ui/` | Generic primitives (Button, Card, Modal) |
| `components/lesson/` | Lesson exercise components |
| `lib/` | Pure logic — no React, no UI |
| `hooks/` | React hooks — no business logic |
| `store/` | Zustand stores — state only |
| `content/` | JSON lesson files — no code |
| `prisma/` | Schema + migrations + seed only |
| `types/` | TypeScript types — no logic |

---

## How to Run Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in values from Supabase + Lemon Squeezy dashboards

# Run database migrations
npx prisma migrate dev

# Seed lesson content
npx prisma db seed

# Start dev server
npm run dev
```

---

## Naming Conventions

- **Files:** `kebab-case.tsx` for components, `camelCase.ts` for lib/hooks
- **Components:** `PascalCase`
- **Hooks:** `useFeatureName`
- **Stores:** `featureStore`
- **API routes:** REST-style nouns (`/api/progress` not `/api/saveProgress`)
- **DB columns:** `snake_case` (Prisma maps to camelCase in TS)
- **i18n keys:** `snake_case` (`lesson_complete`, `btn_check`)

---

## Testing

- Unit tests: `lib/game/` functions (xp, streak, srs, gems) — use Vitest
- E2E tests: auth flow + lesson completion — use Playwright
- Run tests: `npm test`
- Do not ship Phase 4 without tests passing

---

## Common Mistakes to Avoid

1. **Do not use `useEffect` to fetch data** — use Server Components or SWR
2. **Do not import server-only modules in Client Components** — check for `'use client'`
3. **Do not skip Lemon Squeezy webhook signature verification** — security critical
4. **Do not hardcode variant IDs** — always use `lib/lemonsqueezy/plans.ts`
5. **Do not use `any` in TypeScript** — define proper types in `types/`
6. **Do not commit `.env.local`** — it is in `.gitignore`
7. **Do not run `prisma migrate dev` in production** — use `prisma migrate deploy`
8. **Do not inline i18n strings** — always use `t('key')`

---

## Links & Resources

- Supabase Dashboard: https://app.supabase.com
- Lemon Squeezy Dashboard: https://app.lemonsqueezy.com
- Lemon Squeezy JS SDK: https://github.com/lemon-squeezy/lemonsqueezy.js
- Vercel Dashboard: https://vercel.com/dashboard
- Prisma Docs: https://www.prisma.io/docs
- Next.js App Router Docs: https://nextjs.org/docs/app
- Supabase Auth Helpers: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
