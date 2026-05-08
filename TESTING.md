# LINGOBRIDGE — TEST SUITE SETUP GUIDE
> Drop this file in your project root alongside PLAN.md and CLAUDE.md
> Follow each section in order before running any tests

---

## 1. Install test dependencies

Run this once in your project root:

```bash
# Vitest + React Testing Library (unit + API tests)
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom

# Playwright (E2E tests)
npm install -D @playwright/test
npx playwright install chromium
```

---

## 2. Add config files

### `vitest.config.ts` — add to project root
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
})
```

### `playwright.config.ts` — add to project root
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,         // run sequentially to avoid auth conflicts
  retries: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

### `tests/setup.ts` — global test setup
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Suppress console.error in tests unless explicitly testing for errors
vi.spyOn(console, 'error').mockImplementation(() => {})
```

### `.env.test` — test environment variables (never commit)
```bash
# Copy .env.local and add these test-specific vars
TEST_USER_EMAIL=your-test-account@gmail.com
TEST_USER_PASSWORD=YourTestPassword123!
TEST_USER_ID=the-supabase-uuid-of-your-test-account
```

---

## 3. Add test scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run tests/unit/",
    "test:api": "vitest run tests/api/",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "vitest run && playwright test"
  }
}
```

---

## 4. Add `data-testid` attributes to your components

The E2E tests rely on `data-testid` attributes. Claude Code needs to add these to the
correct elements. Use the prompt in Section 6 below.

Required attributes — add these to your components:

| data-testid | Component | Element |
|---|---|---|
| `lang-card-vi` | Welcome | Vietnamese language card |
| `lang-card-hi` | Welcome | Hindi language card |
| `lang-card-en` | Welcome | English/dev language card |
| `start-btn` | Welcome | Start learning button |
| `email-input` | Login/Signup | Email field |
| `password-input` | Login/Signup | Password field |
| `submit-btn` | Login/Signup | Submit button |
| `auth-error` | Login/Signup | Error message div |
| `pt-progress` | Placement | Progress bar wrapper |
| `pt-fill` | Placement | Progress bar fill div |
| `pt-question` | Placement | Question text |
| `pt-option` | Placement | Each answer button |
| `pt-continue-btn` | Placement | Final continue button |
| `skill-node-active` | Home/SkillTree | Active (green) skill node |
| `skill-node-premium` | Home/SkillTree | Premium (amber) skill node |
| `unit-premium` | Home/SkillTree | Premium unit header |
| `xp-badge` | TopBar | XP counter badge |
| `streak-badge` | TopBar | Streak counter badge |
| `lesson-progress` | Lesson | Progress bar fill |
| `hearts` | Lesson | Hearts container |
| `heart` | Lesson | Each heart element |
| `mc-option` | Lesson/MC | Each MC answer button |
| `btn-check` | Lesson | Check answer button |
| `btn-continue` | Lesson | Continue button |
| `feedback-banner` | Lesson | Feedback banner |
| `lesson-complete` | Lesson | Complete screen |
| `lesson-complete-back-btn` | Lesson | Back to home button |
| `lesson-close` | Lesson | Close/X button |
| `paywall-modal` | Paywall | Modal container |
| `paywall-close` | Paywall | Close button |
| `plan-monthly` | Paywall | Monthly plan card |
| `plan-annual` | Paywall | Annual plan card |
| `fc-scene` | Flashcards | Clickable card scene |
| `fc-front` | Flashcards | Card front face |
| `fc-back` | Flashcards | Card back face |
| `fc-front-word` | Flashcards | Front word text |
| `fc-btn-easy` | Flashcards | Easy rating button |
| `fc-btn-good` | Flashcards | Good rating button |
| `profile-name` | Profile | User display name |
| `xp-bar` | Profile | XP progress bar |
| `badges-grid` | Profile | Badges container |
| `learning-direction` | Profile | Learning direction setting |
| `premium-banner` | Profile | Upgrade banner |
| `logout-btn` | Profile | Logout button |

---

## 5. Run order

Always run in this order — stop if any layer fails:

```bash
# Step 1 — Game logic (fastest, no DB needed)
npm run test:unit

# Step 2 — API routes (mocked DB, no server needed)
npm run test:api

# Step 3 — E2E (requires running app + real test user in Supabase)
npm run dev &          # start app in background
npm run test:e2e
```

---

## 6. Claude Code prompts — use these exactly

### Prompt A — Set up test infrastructure
```
Read PLAN.md, CLAUDE.md, and TESTING.md fully.

Set up the test infrastructure:
1. Install all dependencies listed in TESTING.md Section 1
2. Create vitest.config.ts exactly as shown in TESTING.md Section 2
3. Create playwright.config.ts exactly as shown in TESTING.md Section 2
4. Create tests/setup.ts exactly as shown in TESTING.md Section 2
5. Add the test scripts to package.json exactly as shown in TESTING.md Section 3
6. Create .env.test from .env.local and add the three TEST_ variables (leave values blank)

Do not modify any existing source files. Only create new config files.
Tell me when done and what to fill in .env.test.
```

### Prompt B — Add data-testid attributes
```
Read TESTING.md Section 4 — the data-testid table.

Go through each row in the table and add the data-testid attribute to the correct
element in the correct component file. Do not change any logic, styling, or structure.
Only add data-testid="..." attributes.

Work through the table top to bottom. After each component file is updated,
tell me the filename and how many attributes were added before moving to the next.
```

### Prompt C — Run unit tests and fix failures
```
Run: npm run test:unit

For each failing test:
1. Show me the exact test name and error message
2. Identify whether the failure is in the test file or the source file
3. If the source file has a bug — show me the specific function and propose a fix
4. If the test expectation is wrong — explain why and propose a correction
5. Wait for my approval before making any change
6. After I approve, make the minimal fix only

Do not refactor working code. Do not change passing tests.
```

### Prompt D — Run API tests and fix failures
```
Run: npm run test:api

Follow the same process as Prompt C:
1. Show failing test name + error
2. Identify source vs test issue
3. Propose minimal fix
4. Wait for approval
5. Apply fix only after confirmation

Pay special attention to:
- 401 responses — the auth mock must be correctly applied
- 403 responses — free tier limits must match FREE_LIMITS in lib/game/limits.ts
- Response shapes — must exactly match the interfaces in PLAN.md Section 7
```

### Prompt E — Run E2E tests and fix failures
```
Make sure the app is running on localhost:3000 before starting.
Make sure .env.test has TEST_USER_EMAIL and TEST_USER_PASSWORD filled in.

Run: npm run test:e2e

For each failing test:
1. Show the test name, the action that failed, and the error
2. Check if the data-testid attribute is missing from the component
3. Check if the element is not rendering as expected
4. Propose the minimal fix — either add a missing testid or fix the component behaviour
5. Wait for my approval before changing anything

Do not change test expectations unless the behaviour described is genuinely wrong.
```

### Prompt F — Generate test coverage report
```
Run: npx vitest run --coverage

Show me:
1. Overall coverage percentage for lib/game/ files
2. Any function in lib/game/ with less than 80% coverage
3. For each under-covered function, suggest what additional test cases would improve it

Do not write new tests yet — just report and recommend.
```

---

## 7. What passing looks like

When all three layers pass you should see:

```
Unit tests   ✓  35+ tests passing   lib/game/* fully covered
API tests    ✓  22+ tests passing   all routes validated
E2E tests    ✓  28+ tests passing   all critical flows verified
```

At that point the app is ready for your 10 Vietnamese beta testers.
Give them the task list in BETA.md (create this next).
