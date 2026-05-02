# Lingobridge — Full Technical Build Plan
> Web-first · Vietnamese ↔ Hindi · Freemium SaaS
> Written for use with Claude Code. Read this before writing any code.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack Decision](#2-tech-stack-decision)
3. [Repository Structure](#3-repository-structure)
4. [Database Schema](#4-database-schema)
5. [Authentication](#5-authentication)
6. [Phase-by-Phase Build Plan](#6-phase-by-phase-build-plan)
7. [API Design](#7-api-design)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Payments & Subscriptions](#9-payments--subscriptions)
10. [Content System](#10-content-system)
11. [Environment Variables](#11-environment-variables)
12. [Deployment](#12-deployment)
13. [Claude Code Prompting Guide](#13-claude-code-prompting-guide)

---

## 1. Project Overview

**Lingobridge** is a web-first language learning app that teaches Vietnamese speakers Hindi and Hindi speakers Vietnamese. It is modelled on Duolingo's engagement system (streaks, XP, gamification) with culturally authentic content for both communities.

### Core Features (Web MVP)
- Email + Google OAuth login
- Language selection (Vietnamese or Hindi as native)
- Placement test to determine starting level
- Skill tree with lessons (multiple choice, word assembly, pronunciation)
- Spaced-repetition flashcards
- Streak tracking + XP system
- Weekly leaderboard
- Gems shop (streak freeze, XP boost, etc.)
- Freemium model — free tier + Lingobridge Plus subscription via Lemon Squeezy
- Full i18n: entire UI renders in Vietnamese or Hindi based on user's native language

### Out of Scope for Web MVP (Phase 3+)
- Native mobile apps (React Native / Expo — Phase 3)
- Speech recognition (simulated in MVP, real API in Phase 2)
- Social features / friend system
- Admin CMS for content

---

## 2. Tech Stack Decision

### Why this stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | **Next.js 14 (App Router)** | SSR for SEO, file-based routing, React ecosystem, Vercel-native |
| Styling | **Tailwind CSS** | Rapid UI, design tokens, consistent with prototype |
| Auth | **Supabase Auth** | Built-in OAuth, email magic links, row-level security |
| Database | **Supabase PostgreSQL** | Relational + RLS policies, real-time subscriptions, free tier |
| ORM | **Prisma** | Type-safe queries, migration system, works with Supabase |
| Payments | **Lemon Squeezy** | Merchant of record — no business entity needed, works for individual sellers in India, native subscription support |
| Storage | **Supabase Storage** | Audio files for lessons, user avatars |
| Deployment | **Vercel** | Zero-config Next.js, preview deployments per branch |
| Email | **Resend** | Transactional email (welcome, streak reminders) |
| Analytics | **Posthog** | Self-hostable, free tier, event tracking |

### Why Lemon Squeezy over Stripe
Lemon Squeezy acts as the **merchant of record** — they handle all tax, VAT, and legal compliance globally on your behalf. This means:
- No business entity required to start accepting payments
- Works for individual sellers based in India
- Subscriptions, webhooks, and a customer portal are all built-in
- Trade-off: 5% + $0.50 per transaction (vs Stripe's 2.9% + $0.30)
- Migration path: when you register a business and want lower fees, swap `lib/lemonsqueezy/` → `lib/stripe/` and update the three API routes. Everything else stays the same.

### What we are NOT using yet
- Redis — add when leaderboard queries become slow (>10K users)
- RevenueCat — add when building mobile apps
- Separate CMS — lesson content lives in JSON seed files for now

---

## 3. Repository Structure

```
lingobridge/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts     # Supabase OAuth callback
│   ├── (app)/                    # Protected routes (require login)
│   │   ├── layout.tsx            # Shell with sidebar nav
│   │   ├── home/page.tsx         # Skill tree + daily goal
│   │   ├── lesson/[id]/page.tsx  # Lesson engine
│   │   ├── flashcards/page.tsx
│   │   ├── league/page.tsx
│   │   ├── shop/page.tsx
│   │   ├── explore/page.tsx
│   │   └── profile/page.tsx
│   ├── api/
│   │   ├── auth/[...supabase]/route.ts
│   │   ├── progress/route.ts     # Save lesson progress
│   │   ├── streak/route.ts       # Update streak
│   │   ├── leaderboard/route.ts
│   │   ├── gems/route.ts
│   │   └── lemonsqueezy/
│   │       ├── checkout/route.ts
│   │       ├── portal/route.ts
│   │       └── webhook/route.ts
│   ├── layout.tsx                # Root layout, i18n provider
│   └── page.tsx                  # Welcome / landing page
│
├── components/
│   ├── ui/                       # Primitive components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   ├── lesson/
│   │   ├── MultipleChoice.tsx
│   │   ├── WordAssembly.tsx
│   │   ├── PronunciationExercise.tsx
│   │   ├── CharacterCard.tsx
│   │   ├── FeedbackBanner.tsx
│   │   └── LessonComplete.tsx
│   ├── nav/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── home/
│   │   ├── SkillTree.tsx
│   │   ├── SkillNode.tsx
│   │   ├── DailyGoalBar.tsx
│   │   └── StatsRow.tsx
│   └── shared/
│       ├── StreakBadge.tsx
│       ├── XPBadge.tsx
│       └── GemsBadge.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client (SSR)
│   │   └── middleware.ts         # Auth middleware
│   ├── lemonsqueezy/
│   │   ├── client.ts
│   │   └── plans.ts              # Variant IDs and pricing config
│   ├── i18n/
│   │   ├── index.ts              # t() translation function
│   │   ├── vi.ts                 # Vietnamese strings
│   │   ├── hi.ts                 # Hindi strings
│   │   └── en.ts                 # English (builder/dev mode)
│   ├── game/
│   │   ├── xp.ts                 # XP calculation logic
│   │   ├── streak.ts             # Streak check/update logic
│   │   ├── srs.ts                # Spaced repetition algorithm (SM-2)
│   │   └── gems.ts               # Gems transaction logic
│   └── content/
│       ├── loader.ts             # Load lessons from JSON
│       └── types.ts              # TypeScript types for content
│
├── content/                      # Lesson content (JSON files)
│   ├── vi-hi/                    # Vietnamese learning Hindi
│   │   ├── unit-1/
│   │   │   ├── lesson-1-greetings.json
│   │   │   ├── lesson-2-numbers.json
│   │   │   └── lesson-3-tones.json
│   │   └── unit-2/
│   └── hi-vi/                    # Hindi learning Vietnamese
│       └── unit-1/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # Seed lesson content into DB
│
├── hooks/
│   ├── useUser.ts                # Auth + profile state
│   ├── useProgress.ts            # Lesson progress
│   ├── useStreak.ts
│   ├── useI18n.ts                # Language context
│   └── useLeaderboard.ts
│
├── store/                        # Zustand global state
│   ├── userStore.ts
│   ├── lessonStore.ts
│   └── i18nStore.ts
│
├── types/
│   ├── database.ts               # Generated Supabase types
│   └── app.ts                    # App-specific types
│
├── middleware.ts                 # Next.js middleware (auth guard)
├── PLAN.md                       # This file
├── CLAUDE.md                     # Claude Code context
├── .env.local                    # Local environment variables
└── .env.example                  # Template (commit this, not .env.local)
```

---

## 4. Database Schema

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── USERS ───────────────────────────────────────────
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  displayName       String?
  avatarUrl         String?
  nativeLang        Lang      @default(EN)       // VI | HI | EN(dev)
  targetLang        Lang                          // derived from nativeLang
  level             Level     @default(BEGINNER)
  totalXp           Int       @default(0)
  gems              Int       @default(0)
  streakCurrent     Int       @default(0)
  streakLongest     Int       @default(0)
  streakLastDate    DateTime?
  streakFreezeCount Int       @default(0)
  isPremium         Boolean   @default(false)
  lsCustomerId      String?   @unique  // Lemon Squeezy customer ID
  lsSubscriptionId  String?   @unique  // Lemon Squeezy subscription ID
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  progress          LessonProgress[]
  flashcardReviews  FlashcardReview[]
  gemTransactions   GemTransaction[]
  subscription      Subscription?
  weeklyXp          WeeklyXp[]

  @@map("users")
}

enum Lang  { VI HI EN }
enum Level { BEGINNER ELEMENTARY INTERMEDIATE ADVANCED }

// ─── LESSONS ─────────────────────────────────────────
model Unit {
  id          String   @id @default(uuid())
  slug        String   @unique  // e.g. "unit-1-foundations"
  order       Int
  langPair    String            // e.g. "hi-vi" or "vi-hi"
  titleKey    String            // i18n key
  isPremium   Boolean  @default(false)
  lessons     Lesson[]

  @@map("units")
}

model Lesson {
  id          String   @id @default(uuid())
  slug        String   @unique
  order       Int
  titleKey    String
  unitId      String
  xpReward    Int      @default(15)
  unit        Unit     @relation(fields: [unitId], references: [id])
  progress    LessonProgress[]
  exercises   Exercise[]

  @@map("lessons")
}

model Exercise {
  id          String       @id @default(uuid())
  lessonId    String
  order       Int
  type        ExerciseType // MC | ASSEMBLE | SPEAK | FLASHCARD
  data        Json         // flexible exercise payload
  lesson      Lesson       @relation(fields: [lessonId], references: [id])

  @@map("exercises")
}

enum ExerciseType { MC ASSEMBLE SPEAK FLASHCARD }

// ─── PROGRESS ────────────────────────────────────────
model LessonProgress {
  id          String   @id @default(uuid())
  userId      String
  lessonId    String
  completed   Boolean  @default(false)
  accuracy    Float?
  xpEarned    Int      @default(0)
  completedAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
  lesson      Lesson   @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
  @@map("lesson_progress")
}

// ─── FLASHCARDS ──────────────────────────────────────
model FlashcardReview {
  id           String   @id @default(uuid())
  userId       String
  cardId       String   // references exercise.id where type=FLASHCARD
  interval     Int      @default(1)    // days until next review (SM-2)
  easeFactor   Float    @default(2.5)  // SM-2 ease factor
  repetitions  Int      @default(0)
  nextReview   DateTime @default(now())
  lastReview   DateTime?
  user         User     @relation(fields: [userId], references: [id])

  @@unique([userId, cardId])
  @@map("flashcard_reviews")
}

// ─── GEMS ────────────────────────────────────────────
model GemTransaction {
  id        String          @id @default(uuid())
  userId    String
  amount    Int             // positive = earn, negative = spend
  reason    GemReason
  createdAt DateTime        @default(now())
  user      User            @relation(fields: [userId], references: [id])

  @@map("gem_transactions")
}

enum GemReason {
  LESSON_COMPLETE
  STREAK_MILESTONE
  PURCHASE
  STREAK_FREEZE_USED
  XP_BOOST_USED
  SKIP_LESSON_USED
  BONUS_DECK_UNLOCKED
}

// ─── SUBSCRIPTIONS ───────────────────────────────────
model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique
  lsSubscriptionId     String             @unique  // Lemon Squeezy subscription ID
  lsVariantId          String                      // Lemon Squeezy variant (monthly/annual/family)
  lsCustomerId         String
  status               SubscriptionStatus
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  user                 User               @relation(fields: [userId], references: [id])

  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  INCOMPLETE
  TRIALING
}

// ─── LEADERBOARD ─────────────────────────────────────
model WeeklyXp {
  id        String   @id @default(uuid())
  userId    String
  weekStart DateTime // Monday 00:00:00 UTC
  xp        Int      @default(0)
  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, weekStart])
  @@map("weekly_xp")
}
```

### Supabase Row Level Security Policies
```sql
-- Users can only read/update their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_data" ON users
  USING (auth.uid() = id);

-- Progress is private to each user
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_own" ON lesson_progress
  USING (auth.uid() = user_id);

-- Leaderboard is publicly readable
ALTER TABLE weekly_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaderboard_public_read" ON weekly_xp
  FOR SELECT USING (true);
CREATE POLICY "leaderboard_own_write" ON weekly_xp
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 5. Authentication

### Flow
```
1. User visits lingobridge.app
2. Sees welcome screen → picks language (VI / HI / EN-dev)
3. Clicks "Start Learning" → /login (if not authed) or /placement (if authed, new user)
4. Login options: Google OAuth | Email magic link
5. Supabase handles session → cookie set via middleware
6. New user → placement test → profile created in DB
7. Returning user → redirected straight to /home
```

### Middleware (`middleware.ts`)
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const isAppRoute = req.nextUrl.pathname.startsWith('/(app)')
  if (isAppRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}

export const config = {
  matcher: ['/(app)/:path*']
}
```

---

## 6. Phase-by-Phase Build Plan

### PHASE 1 — Foundation (Weeks 1–3)
Goal: Working app with auth, home screen, and one playable lesson that saves progress.

```
[ ] 1.1  Scaffold Next.js 14 project
          npx create-next-app@latest lingobridge --typescript --tailwind --app

[ ] 1.2  Install dependencies
          npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
          npm install prisma @prisma/client
          npm install zustand
          npm install "@lemonsqueezy/lemonsqueezy.js"
          npm install resend
          npm install posthog-js

[ ] 1.3  Supabase project setup
          - Create project at supabase.com
          - Copy URL + anon key to .env.local
          - Enable Google OAuth in Supabase Auth dashboard
          - Run prisma migrate dev to create tables

[ ] 1.4  Auth pages
          - /login — email magic link + Google button
          - /signup — same as login (Supabase handles both)
          - /auth/callback — Supabase redirect handler

[ ] 1.5  i18n system
          - Create lib/i18n/vi.ts, hi.ts, en.ts
          - Create useI18n() hook + i18nStore (Zustand)
          - t() function for all string lookups

[ ] 1.6  Welcome page (/)
          - Language picker (VI / HI / EN-dev)
          - Sets lang in i18nStore
          - "Start" → /login if unauthed, /placement if new user

[ ] 1.7  Placement test (/placement)
          - 3 adaptive questions (from content JSON)
          - Sets user.level in DB on completion
          - Redirects to /home

[ ] 1.8  App shell layout
          - Sidebar nav (all routes)
          - Top bar (streak, XP, gems badges)
          - Auth guard via middleware

[ ] 1.9  Home screen (/home)
          - Fetch user progress from DB
          - Render skill tree (units + nodes)
          - Daily goal progress bar
          - Stats row (streak, XP, league)

[ ] 1.10 Lesson engine (/lesson/[id])
          - Load exercises from DB (type: MC, ASSEMBLE, SPEAK)
          - Exercise renderer (MultipleChoice, WordAssembly, Pronunciation)
          - Hearts system (3 lives)
          - Progress bar
          - FeedbackBanner (correct/wrong)
          - Lesson complete screen
          - POST /api/progress on completion (save XP, mark lesson done)
          - POST /api/streak on completion (update streak)

[ ] 1.11 Seed content
          - Write lesson JSON for Unit 1 (Greetings, Numbers, Tones)
          - prisma/seed.ts to load JSON into DB
          - Both language pairs (vi-hi and hi-vi)
```

### PHASE 2 — Engagement (Weeks 4–6)
Goal: All engagement systems working. Users have a reason to come back daily.

```
[ ] 2.1  Flashcards (/flashcards)
          - Load due cards from DB (nextReview <= now())
          - Flip animation
          - SM-2 algorithm in lib/game/srs.ts
          - Rate card → update FlashcardReview in DB

[ ] 2.2  Leaderboard (/league)
          - GET /api/leaderboard → top 10 by weeklyXp for current week
          - Weekly reset via Supabase cron (pg_cron)
          - User's current rank highlighted

[ ] 2.3  Streak system
          - Check streak on app load (did user play yesterday?)
          - Streak broken → show recovery modal
          - Streak milestones (7, 30, 100 days) → award gems

[ ] 2.4  XP + levelling
          - Level thresholds: 0→100 (Beginner), 100→300, 300→600, 600→1000
          - Level-up modal with animation

[ ] 2.5  Explore screen (/explore)
          - Cultural content cards (Tết, Diwali)
          - Phrase book (static content from JSON)

[ ] 2.6  Profile screen (/profile)
          - User stats
          - Badges (earned/locked)
          - Settings (daily goal, notification preferences)

[ ] 2.7  Email — Resend integration
          - Welcome email on signup
          - Streak reminder (daily, if user hasn't played by 7pm local)
          - Streak broken recovery email

[ ] 2.8  Analytics — PostHog
          - Track: lesson_started, lesson_completed, streak_updated,
            language_selected, placement_completed
```

### PHASE 3 — Monetisation (Weeks 7–9)
Goal: Revenue working. Free tier enforced. Lemon Squeezy subscriptions live.

```
[ ] 3.1  Lemon Squeezy setup
          - Create a Lemon Squeezy store at app.lemonsqueezy.com
          - Create a product: "Lingobridge Plus"
          - Add three variants (Lemon Squeezy calls plans "variants"):
            Monthly  — $6.99/mo
            Annual   — $49.99/yr
            Family   — $79.99/yr (up to 6 members)
          - Copy variant IDs into lib/lemonsqueezy/plans.ts
          - Install SDK: npm install "@lemonsqueezy/lemonsqueezy.js"

[ ] 3.2  Free tier enforcement
          - Max 5 lessons/day for free users (check in /api/progress)
          - Lessons 5+ locked in skill tree (show paywall modal)
          - Unit 5 fully locked for free users

[ ] 3.3  Paywall modal
          - Triggers when free user hits lesson limit or clicks premium node
          - Shows plan comparison (Monthly / Annual / Family)
          - "Upgrade" → /api/lemonsqueezy/checkout

[ ] 3.4  Lemon Squeezy Checkout
          - POST /api/lemonsqueezy/checkout
          - Use lemonSqueezySetup() + createCheckout() from SDK
          - Returns a checkout URL → redirect user to Lemon Squeezy hosted page
          - On success Lemon Squeezy redirects back to /home?upgraded=true

[ ] 3.5  Lemon Squeezy Webhook (/api/lemonsqueezy/webhook)
          - Verify webhook signature using LEMONSQUEEZY_WEBHOOK_SECRET
          - Handle: subscription_created   → set isPremium=true, write Subscription row
          - Handle: subscription_cancelled → set isPremium=false at period end
          - Handle: subscription_expired   → set isPremium=false immediately
          - Handle: subscription_payment_failed → send recovery email via Resend

[ ] 3.6  Customer Portal
          - POST /api/lemonsqueezy/portal
          - Use SDK getSubscription() → returns portal URL
          - Accessible from /profile → "Manage Subscription"
          - Lemon Squeezy portal handles upgrades, downgrades, cancellations

[ ] 3.7  Gems Shop (/shop)
          - Display items (Streak Freeze, XP Boost, etc.)
          - Buy with gems → POST /api/gems
          - Gem balance deducted, item applied to user record

[ ] 3.8  Gems earning
          - +5 gems per lesson completed
          - +10 gems for 7-day streak milestone
          - +25 gems for 30-day streak milestone
```

### PHASE 4 — Polish & Launch (Weeks 10–12)
```
[ ] 4.1  Performance audit (Lighthouse score ≥ 90)
[ ] 4.2  SEO — metadata, sitemap, og:image for social sharing
[ ] 4.3  Error boundaries + Sentry error tracking
[ ] 4.4  Loading skeletons on all data-fetching pages
[ ] 4.5  Accessibility audit (WCAG 2.1 AA)
[ ] 4.6  Unit tests for game logic (xp.ts, srs.ts, streak.ts)
[ ] 4.7  E2E tests for auth + lesson flow (Playwright)
[ ] 4.8  Custom domain on Vercel
[ ] 4.9  Cookie banner + Privacy Policy page (GDPR)
[ ] 4.10 Launch checklist sign-off
```

---

## 7. API Design

All API routes live under `/app/api/`. They use Next.js Route Handlers.

### POST `/api/progress`
Saves lesson completion. Called when user finishes a lesson.
```typescript
// Request body
{
  lessonId: string
  accuracy: number      // 0–1
  xpEarned: number
  heartsRemaining: number
}

// Response
{
  success: boolean
  newTotalXp: number
  leveledUp: boolean
  newLevel?: string
  gemsAwarded: number
}
```

### POST `/api/streak`
Updates the user's streak. Called after every lesson completion.
```typescript
// Request body — none (uses session)

// Logic
// 1. Get user.streakLastDate
// 2. If lastDate is yesterday → increment streakCurrent
// 3. If lastDate is today → no change
// 4. If lastDate is > 1 day ago → check streakFreezeCount
//    - If freeze available → use it, decrement freeze count
//    - Else → reset streakCurrent to 1
// 5. Update streakLastDate to today
// 6. If milestone (7,30,100,365) → award gems

// Response
{
  streakCurrent: number
  streakLongest: number
  milestone?: number
  gemsAwarded?: number
}
```

### GET `/api/leaderboard`
Returns top 10 + calling user's rank for the current week.
```typescript
// Response
{
  topTen: Array<{
    rank: number
    userId: string
    displayName: string
    avatarUrl: string | null
    nativeLang: string
    xp: number
  }>
  userRank: number
  userXp: number
}
```

### POST `/api/gems`
Spend gems on a shop item.
```typescript
// Request body
{
  item: 'STREAK_FREEZE' | 'EXTRA_HEART' | 'XP_BOOST' | 'SKIP_LESSON' | 'AVATAR_FRAME' | 'BONUS_DECK'
}

// Logic: check balance, deduct, apply effect, write GemTransaction

// Response
{
  success: boolean
  newBalance: number
  error?: 'INSUFFICIENT_GEMS' | 'ITEM_NOT_FOUND'
}
```

### POST `/api/lemonsqueezy/checkout`
Creates a Lemon Squeezy checkout session for a subscription variant.
```typescript
// Request body
{ variantId: string }   // from lib/lemonsqueezy/plans.ts

// Response
{ url: string }         // redirect user to this Lemon Squeezy checkout URL
```

### POST `/api/lemonsqueezy/webhook`
Lemon Squeezy sends events here. Must verify signature with LEMONSQUEEZY_WEBHOOK_SECRET.
```typescript
// Handled events:
// subscription_created        → activate subscription, set isPremium=true
// subscription_cancelled      → set cancelAtPeriodEnd=true
// subscription_expired        → set isPremium=false immediately
// subscription_payment_failed → send recovery email via Resend
```

---

## 8. Frontend Architecture

### State Management (Zustand)

Three stores cover all global state:

```typescript
// store/userStore.ts
interface UserStore {
  user: User | null
  isLoading: boolean
  isPremium: boolean
  streak: number
  totalXp: number
  gems: number
  setUser: (user: User) => void
  updateXp: (amount: number) => void
  updateStreak: (data: StreakData) => void
  spendGems: (amount: number) => void
}

// store/i18nStore.ts
interface I18nStore {
  lang: 'vi' | 'hi' | 'en'
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

// store/lessonStore.ts
interface LessonStore {
  currentExercise: number
  hearts: number
  answers: Answer[]
  isComplete: boolean
  nextExercise: () => void
  recordAnswer: (answer: Answer) => void
  loseHeart: () => void
  reset: () => void
}
```

### Component Pattern

All components follow this pattern:
```typescript
// components/lesson/MultipleChoice.tsx
interface MultipleChoiceProps {
  exercise: MCExercise
  onAnswer: (correct: boolean) => void
  lang: Lang
}

export function MultipleChoice({ exercise, onAnswer, lang }: MultipleChoiceProps) {
  // component logic
}
```

### Data Fetching Pattern
- **Server Components** for initial page loads (lesson list, unit data)
- **Client Components** for interactive state (lesson engine, flashcards)
- **SWR** for client-side data revalidation (leaderboard, streak)

---

## 9. Payments & Subscriptions

### Why Lemon Squeezy
Lemon Squeezy is the merchant of record — they handle all tax collection, VAT, and legal compliance worldwide. You receive payouts as an individual seller with no business entity required. This is the right choice for the current stage.

**Fee structure:** 5% + $0.50 per transaction
**Payout:** Direct to your bank account (supports India)
**Future migration:** When you register a business and want Stripe's lower fees (2.9% + $0.30), only `lib/lemonsqueezy/`, `/api/lemonsqueezy/`, and env vars need updating.

### Plan Config (`lib/lemonsqueezy/plans.ts`)
```typescript
// Variant IDs come from your Lemon Squeezy product dashboard
export const PLANS = {
  monthly: {
    variantId: process.env.LS_VARIANT_MONTHLY!,
    name: 'Lingobridge Plus',
    interval: 'month',
    amount: 699,          // cents — display only
    display: '$6.99/mo'
  },
  annual: {
    variantId: process.env.LS_VARIANT_ANNUAL!,
    name: 'Lingobridge Plus',
    interval: 'year',
    amount: 4999,
    display: '$49.99/yr',
    savings: '40% off'
  },
  family: {
    variantId: process.env.LS_VARIANT_FAMILY!,
    name: 'Lingobridge Plus Family',
    interval: 'year',
    amount: 7999,
    display: '$79.99/yr',
    maxMembers: 6
  }
}
```

### Lemon Squeezy Client (`lib/lemonsqueezy/client.ts`)
```typescript
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy-js'

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error('LS Error:', error),
})
```

### Webhook Signature Verification
```typescript
// Always verify — never skip this in production
import crypto from 'crypto'

export function verifyLSWebhook(rawBody: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
  const digest = hmac.update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}
```

### Free Tier Limits
```typescript
// lib/game/limits.ts
export const FREE_LIMITS = {
  lessonsPerDay: 5,
  newFlashcardsPerDay: 20,
  pronunciationExercisesPerDay: 3,
  unitsAccessible: 4,   // Unit 5 is premium-only
}
```

---

## 10. Content System

### Lesson JSON Format
```json
{
  "id": "vi-hi-u1-l1-greetings",
  "titleKey": "lesson_greetings",
  "unitSlug": "vi-hi-unit-1",
  "xpReward": 15,
  "exercises": [
    {
      "type": "MC",
      "order": 1,
      "data": {
        "promptKey": "what_does_xin_chao_mean",
        "char": "Xin chào",
        "charRoman": "sin chow",
        "options": {
          "vi": ["Xin chào", "Cảm ơn", "Tạm biệt", "Xin lỗi"],
          "hi": ["नमस्ते", "धन्यवाद", "अलविदा", "माफ़ करना"],
          "en": ["Hello", "Thank you", "Goodbye", "Sorry"]
        },
        "correctIndex": 0
      }
    },
    {
      "type": "ASSEMBLE",
      "order": 2,
      "data": {
        "promptKey": "arrange_sentence",
        "words": ["Tôi", "đang", "học", "tiếng", "Việt"],
        "answer": "Tôi đang học tiếng Việt"
      }
    },
    {
      "type": "SPEAK",
      "order": 3,
      "data": {
        "char": "Cảm ơn",
        "charRoman": "gam uhn",
        "targetLang": "vi",
        "passThreshold": 70
      }
    },
    {
      "type": "FLASHCARD",
      "order": 4,
      "data": {
        "front": "Xin chào",
        "frontRoman": "sin chow",
        "back": "नमस्ते",
        "backRoman": "Namaste",
        "meaning": "Hello"
      }
    }
  ]
}
```

---

## 11. Environment Variables

```bash
# .env.local (never commit this)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # server-only, never expose to client

# Database (Prisma)
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres

# Lemon Squeezy (payments — no business entity required)
LEMONSQUEEZY_API_KEY=eyJ...
LEMONSQUEEZY_WEBHOOK_SECRET=whs_...
LEMONSQUEEZY_STORE_ID=12345
LS_VARIANT_MONTHLY=111111
LS_VARIANT_ANNUAL=222222
LS_VARIANT_FAMILY=333333

# Resend (email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@lingobridge.app

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=https://lingobridge.app
NODE_ENV=development
```

---

## 12. Deployment

### Vercel Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Set environment variables (do this for each var in .env.local)
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... repeat for all vars

# Deploy
vercel --prod
```

### Branching Strategy
```
main          → production (lingobridge.app)
staging       → staging (staging.lingobridge.app) — auto-deploy
feature/*     → preview deployments (feature-name.lingobridge.vercel.app)
```

### Lemon Squeezy Webhook Setup
```bash
# Local development — use a tunnel (ngrok or Cloudflare tunnel)
# to expose localhost:3000 to the internet, then register the URL
# in your Lemon Squeezy store dashboard under Settings → Webhooks

ngrok http 3000
# Copy the https URL → add to LS dashboard
# URL: https://your-ngrok-url.ngrok.io/api/lemonsqueezy/webhook
# Events to subscribe: subscription_created, subscription_cancelled,
#                      subscription_expired, subscription_payment_failed

# Production — add in Lemon Squeezy Dashboard → Settings → Webhooks
# URL: https://lingobridge.app/api/lemonsqueezy/webhook
```

---

## 13. Claude Code Prompting Guide

When working with Claude Code on this project, use these prompt patterns for best results.

### Starting a new phase
```
Read PLAN.md and CLAUDE.md fully before starting.
We are on Phase [X]. The next task is [X.Y].
Do not skip steps. Complete one task fully before moving to the next.
After each task, tell me what was built and what the next step is.
```

### Building a specific feature
```
Read PLAN.md section [X] and the relevant files in lib/ and components/.
Build [feature name] exactly as described in the plan.
Use the existing patterns from [nearby component].
Do not introduce new dependencies not listed in PLAN.md section 2.
```

### Database changes
```
Before writing any migration, show me the Prisma schema change first.
Wait for my approval before running prisma migrate dev.
After migrating, update the TypeScript types in types/database.ts.
```

### Debugging
```
Do not rewrite working code to fix a bug.
Isolate the issue first — show me the specific function that is failing.
Propose the minimal fix and wait for approval before applying it.
```

### Working on API routes
```
Follow the API design in PLAN.md section 7 exactly.
All routes must validate the Supabase session before doing anything.
Return typed responses matching the interfaces in PLAN.md section 7.
Handle errors with consistent JSON: { error: string, code: string }.
```
