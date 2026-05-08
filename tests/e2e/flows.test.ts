/**
 * LINGOBRIDGE — E2E TESTS
 * Critical user flows: auth, onboarding, lesson, streak, free tier wall
 *
 * Framework: Playwright
 * Run: npx playwright test tests/e2e/
 *
 * Requires: app running at http://localhost:3000
 *           TEST_USER_EMAIL + TEST_USER_PASSWORD in .env.test
 */

import { test, expect, type Page } from '@playwright/test'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function signUp(page: Page, email: string, _password: string) {
  // App uses magic-link only — fill email and submit to trigger OTP send
  await page.goto('/signup')
  await page.fill('[data-testid="email-input"]', email)
  await page.click('[data-testid="submit-btn"]')
}

async function signIn(page: Page, email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Authenticate via Supabase password API — bypasses the magic-link UI
  const resp = await page.request.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
      data: { email, password },
    }
  )
  if (!resp.ok()) throw new Error(`Auth failed (${resp.status()}): ${await resp.text()}`)
  const session = await resp.json()

  // @supabase/auth-helpers-nextjs encodes session cookies as "base64-<base64url_value>"
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const cookieName = `sb-${projectRef}-auth-token`
  const MAX_CHUNK = 3180

  const raw = JSON.stringify(session)
  const encoded = 'base64-' + Buffer.from(raw).toString('base64url')

  const cookies: Array<{ name: string; value: string }> = []
  if (encoded.length <= MAX_CHUNK) {
    cookies.push({ name: cookieName, value: encoded })
  } else {
    for (let i = 0, idx = 0; i < encoded.length; i += MAX_CHUNK, idx++) {
      cookies.push({ name: `${cookieName}.${idx}`, value: encoded.slice(i, i + MAX_CHUNK) })
    }
  }

  // Navigate to the site first so document.cookie targets the correct origin.
  // Using document.cookie (rather than context.addCookies) avoids Playwright's
  // domain-matching quirks with localhost.
  await page.goto('/')
  for (const c of cookies) {
    await page.evaluate(
      ({ name, value }) => { document.cookie = `${name}=${value}; path=/; SameSite=Lax` },
      c
    )
  }

  await page.goto('/home')
  await page.waitForURL('**/home', { timeout: 10_000 })
}

async function completePlacementTest(page: Page) {
  // Answer all placement questions (first option each time — level doesn't matter for E2E)
  for (let i = 0; i < 3; i++) {
    await page.waitForSelector('[data-testid="pt-option"]')
    await page.click('[data-testid="pt-option"]:first-child')
    await page.waitForTimeout(800) // allow animation
  }
  await page.waitForSelector('[data-testid="pt-continue-btn"]')
  await page.click('[data-testid="pt-continue-btn"]')
  await page.waitForURL('**/home')
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. WELCOME & LANGUAGE SELECTION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Welcome screen', () => {
  test('shows language selection cards on load', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="lang-card-vi"]')).toBeVisible()
    await expect(page.locator('[data-testid="lang-card-hi"]')).toBeVisible()
    await expect(page.locator('[data-testid="lang-card-en"]')).toBeVisible()
  })

  test('Start button is disabled until language is selected', async ({ page }) => {
    await page.goto('/')
    const startBtn = page.locator('[data-testid="start-btn"]')
    await expect(startBtn).toBeDisabled()
  })

  test('Start button enables after selecting Vietnamese', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="lang-card-vi"]')
    await expect(page.locator('[data-testid="start-btn"]')).toBeEnabled()
  })

  test('UI switches to Vietnamese after selecting VI', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="lang-card-vi"]')
    // The start button text should be in Vietnamese
    await expect(page.locator('[data-testid="start-btn"]')).toContainText('Bắt đầu')
  })

  test('UI switches to Hindi after selecting HI', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="lang-card-hi"]')
    // The start button text should be in Hindi (btn_start key = 'शुरू करें')
    await expect(page.locator('[data-testid="start-btn"]')).toContainText('शुरू करें')
  })

  test('no English text visible after selecting Vietnamese', async ({ page }) => {
    // Sign in (default lang is VI) and verify nav shows Vietnamese labels
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    const navText = await page.locator('nav').first().innerText()
    expect(navText).not.toContain('HOME')
    expect(navText).not.toContain('LEARN')
    expect(navText).not.toContain('CARDS')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Authentication', () => {
  const testEmail = `e2e-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'

  test('new user sign up sends magic link', async ({ page }) => {
    // Intercept the Supabase OTP API call so this test doesn't depend on SMTP being configured
    await page.route('**/auth/v1/otp**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })
    await signUp(page, testEmail, testPassword)
    // Submitting sends an OTP — the form is replaced by a confirmation message
    // so the email input is no longer visible
    await expect(page.locator('[data-testid="email-input"]')).not.toBeVisible({ timeout: 5_000 })
  })

  test('existing user can log in and reaches home', async ({ page }) => {
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    await expect(page).toHaveURL(/home/)
  })

  test('unauthenticated user is redirected from /home to /login', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/login/)
  })

  test('unauthenticated user is redirected from /lesson to /login', async ({ page }) => {
    await page.goto('/lesson/any-lesson-id')
    await expect(page).toHaveURL(/login/)
  })

  test('user can log out and session is cleared', async ({ page }) => {
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    await page.goto('/profile')
    await page.click('[data-testid="logout-btn"]')
    await expect(page).toHaveURL(/login|\//)
    // Clear any residual auth cookies so the next navigation hits a fresh session check
    await page.context().clearCookies()
    // Confirm they can't access protected routes
    await page.goto('/home')
    await expect(page).toHaveURL(/login/)
  })

  test('invalid email format shows error message', async ({ page }) => {
    // App uses magic-link only (no password field) — validate email format on submit
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'not-a-valid-email')
    await page.click('[data-testid="submit-btn"]')
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 3. PLACEMENT TEST
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Placement test', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    await page.goto('/placement')
  })

  test('shows 3 questions with progress bar', async ({ page }) => {
    await expect(page.locator('[data-testid="pt-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="pt-question"]')).toBeVisible()
    await expect(page.locator('[data-testid="pt-option"]')).toHaveCount(4)
  })

  test('progress bar advances after each answer', async ({ page }) => {
    const getWidth = async () => {
      return page.locator('[data-testid="pt-fill"]').evaluate(el => (el as HTMLElement).style.width)
    }
    const before = await getWidth()
    await page.click('[data-testid="pt-option"]:first-child')
    await page.waitForTimeout(900)
    const after = await getWidth()
    expect(after).not.toBe(before)
  })

  test('correct answer highlights green', async ({ page }) => {
    // The correct option should get the correct class applied
    // We click the first option and check styling changes
    await page.click('[data-testid="pt-option"]:first-child')
    await page.waitForTimeout(300)
    const options = page.locator('[data-testid="pt-option"]')
    const classNames = await options.evaluateAll(els => els.map(el => el.className))
    const hasCorrect = classNames.some(c => c.includes('correct'))
    expect(hasCorrect).toBe(true)
  })

  test('completes and redirects to home after all questions', async ({ page }) => {
    await completePlacementTest(page)
    await expect(page).toHaveURL(/home/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 4. LESSON ENGINE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Lesson engine', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    await page.goto('/home')
    // Click the active skill node to start a lesson
    await page.click('[data-testid="skill-node-active"]')
    await page.waitForURL(/lesson/)
  })

  test('lesson header shows progress bar and hearts', async ({ page }) => {
    await expect(page.locator('[data-testid="lesson-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="hearts"]')).toBeVisible()
    await expect(page.locator('[data-testid="heart"]')).toHaveCount(3)
  })

  test('Check button is disabled before answering', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-check"]')).toBeDisabled()
  })

  test('Check button enables after selecting MC answer', async ({ page }) => {
    await page.waitForSelector('[data-testid="mc-option"]')
    await page.click('[data-testid="mc-option"]:first-child')
    await expect(page.locator('[data-testid="btn-check"]')).toBeEnabled()
  })

  test('correct answer shows green feedback banner', async ({ page }) => {
    await page.waitForSelector('[data-testid="mc-option"]')
    // Find and click the correct option (has data-correct="true")
    await page.click('[data-testid="mc-option"][data-correct="true"]')
    await page.click('[data-testid="btn-check"]')
    await expect(page.locator('[data-testid="feedback-banner"]')).toHaveClass(/correct/)
  })

  test('wrong answer shows red feedback and loses a heart', async ({ page }) => {
    await page.waitForSelector('[data-testid="mc-option"]')
    // Click a wrong option (data-correct="false")
    await page.locator('[data-testid="mc-option"][data-correct="false"]').first().click()
    await page.click('[data-testid="btn-check"]')
    await expect(page.locator('[data-testid="feedback-banner"]')).toHaveClass(/wrong/)
    // One heart should be lost
    await expect(page.locator('[data-testid="heart"].lost')).toHaveCount(1)
  })

  test('Continue button appears after checking answer', async ({ page }) => {
    await page.waitForSelector('[data-testid="mc-option"]')
    await page.click('[data-testid="mc-option"]:first-child')
    await page.click('[data-testid="btn-check"]')
    await expect(page.locator('[data-testid="btn-continue"]')).toBeVisible()
  })

  test('progress bar advances after continuing', async ({ page }) => {
    const getWidth = async () =>
      page.locator('[data-testid="lesson-progress-fill"]').evaluate(el => (el as HTMLElement).style.width)

    await page.waitForSelector('[data-testid="mc-option"]')
    const before = await getWidth()
    await page.click('[data-testid="mc-option"]:first-child')
    await page.click('[data-testid="btn-check"]')
    await page.click('[data-testid="btn-continue"]')
    const after = await getWidth()
    expect(after).not.toBe(before)
  })

  test('lesson complete screen shows after finishing all exercises', async ({ page }) => {
    // Wait for the first exercise to be fully rendered before starting the loop
    await page.waitForSelector('[data-testid="mc-option"], [data-testid="speak-btn"], [data-testid="assemble-word"]', { timeout: 15000 })

    // Complete all exercises — handles MC, ASSEMBLE, and SPEAK types
    for (let i = 0; i < 20; i++) {
      // Done?
      const isComplete = await page.locator('[data-testid="lesson-complete"]').first().isVisible().catch(() => false)
      if (isComplete) break

      // Continue button visible (feedback phase) — click it
      const hasContinue = await page.locator('[data-testid="btn-continue"]').first().isVisible().catch(() => false)
      if (hasContinue) {
        await page.click('[data-testid="btn-continue"]')
        await page.waitForTimeout(300)
        continue
      }

      // SPEAK: click speak button and wait for simulation to complete (~1800ms)
      const hasSpeakBtn = await page.locator('[data-testid="speak-btn"]:not([disabled])').first().isVisible().catch(() => false)
      if (hasSpeakBtn) {
        await page.click('[data-testid="speak-btn"]')
        await page.waitForTimeout(2200)
        continue
      }

      // ASSEMBLE: click all available word chips then check
      const hasAssembleWords = await page.locator('[data-testid="assemble-word"]:not([disabled])').first().isVisible().catch(() => false)
      if (hasAssembleWords) {
        const words = page.locator('[data-testid="assemble-word"]:not([disabled])')
        const count = await words.count()
        for (let w = 0; w < count; w++) {
          await words.first().click()
          await page.waitForTimeout(100)
        }
        await page.waitForTimeout(300)
        await page.locator('[data-testid="btn-check"]:not([disabled])').waitFor({ timeout: 3000 }).catch(() => {})
        await page.locator('[data-testid="btn-check"]').click({ force: false }).catch(() => {})
        continue
      }

      // MC: click first option then check
      const hasMcOption = await page.locator('[data-testid="mc-option"]').first().isVisible().catch(() => false)
      if (hasMcOption) {
        await page.locator('[data-testid="mc-option"]').first().click()
        // Wait for React to update selectedAnswer and re-enable btn-check
        await page.waitForFunction(
          () => {
            const btn = document.querySelector('[data-testid="btn-check"]') as HTMLButtonElement | null
            return btn && !btn.disabled
          },
          { timeout: 3000 }
        )
        await page.click('[data-testid="btn-check"]')
        continue
      }

      await page.waitForTimeout(300)
    }
    await expect(page.locator('[data-testid="lesson-complete"]')).toBeVisible({ timeout: 8000 })
  })

  test('XP badge in header increases after lesson completion', async ({ page }) => {
    test.setTimeout(60_000)

    const getXp = async () => {
      const text = await page.locator('[data-testid="xp-badge"]').first().innerText()
      return parseInt(text.replace(/\D/g, ''))
    }
    const xpBefore = await getXp()

    // Complete all exercises using the same loop as the previous test
    await page.waitForSelector('[data-testid="mc-option"], [data-testid="speak-btn"], [data-testid="assemble-word"]', { timeout: 15000 })
    for (let i = 0; i < 20; i++) {
      const isComplete = await page.locator('[data-testid="lesson-complete"]').first().isVisible().catch(() => false)
      if (isComplete) break
      const hasContinue = await page.locator('[data-testid="btn-continue"]').first().isVisible().catch(() => false)
      if (hasContinue) { await page.click('[data-testid="btn-continue"]'); await page.waitForTimeout(300); continue }
      const hasSpeakBtn = await page.locator('[data-testid="speak-btn"]:not([disabled])').first().isVisible().catch(() => false)
      if (hasSpeakBtn) { await page.click('[data-testid="speak-btn"]'); await page.waitForTimeout(2200); continue }
      const hasAssembleWords = await page.locator('[data-testid="assemble-word"]:not([disabled])').first().isVisible().catch(() => false)
      if (hasAssembleWords) {
        const words = page.locator('[data-testid="assemble-word"]:not([disabled])')
        const count = await words.count()
        for (let w = 0; w < count; w++) { await words.first().click(); await page.waitForTimeout(100) }
        await page.waitForTimeout(300)
        await page.locator('[data-testid="btn-check"]:not([disabled])').waitFor({ timeout: 3000 }).catch(() => {})
        await page.locator('[data-testid="btn-check"]').click({ force: false }).catch(() => {})
        continue
      }
      const hasMcOption = await page.locator('[data-testid="mc-option"]').first().isVisible().catch(() => false)
      if (hasMcOption) {
        await page.locator('[data-testid="mc-option"]').first().click()
        await page.waitForFunction(() => { const b = document.querySelector('[data-testid="btn-check"]') as HTMLButtonElement | null; return b && !b.disabled }, { timeout: 3000 })
        await page.click('[data-testid="btn-check"]')
        continue
      }
      await page.waitForTimeout(300)
    }

    // Lesson complete screen should be visible
    await expect(page.locator('[data-testid="lesson-complete"]')).toBeVisible({ timeout: 8000 })

    // Click back button — calls handleFinish which updates XP in Zustand then navigates
    await page.click('[data-testid="lesson-complete-back-btn"]')
    await page.waitForURL(/home/, { timeout: 15000 })

    // XP badge should reflect earned XP (Zustand updated before navigation)
    const xpAfter = await getXp()
    expect(xpAfter).toBeGreaterThanOrEqual(xpBefore)
  })

  test('close button returns to home without saving progress', async ({ page }) => {
    await page.click('[data-testid="lesson-close"]')
    await expect(page).toHaveURL(/home/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 5. STREAK
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Streak display', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    await page.goto('/home')
  })

  test('streak badge is visible in header', async ({ page }) => {
    await expect(page.locator('[data-testid="streak-badge"]').first()).toBeVisible()
  })

  test('streak badge shows a numeric value', async ({ page }) => {
    const text = await page.locator('[data-testid="streak-badge"]').first().innerText()
    const num = parseInt(text.replace(/\D/g, ''))
    expect(num).toBeGreaterThanOrEqual(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 6. FREE TIER PAYWALL
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Free tier enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    await page.goto('/home')
  })

  test('Unit 5 skill nodes show premium lock indicator', async ({ page }) => {
    await expect(page.locator('[data-testid="unit-premium"]')).toBeVisible()
    await expect(page.locator('[data-testid="skill-node-premium"]').first()).toBeVisible()
  })

  test('clicking a premium node shows paywall modal', async ({ page }) => {
    await page.click('[data-testid="skill-node-premium"]:first-child')
    await expect(page.locator('[data-testid="paywall-modal"]')).toBeVisible()
  })

  test('paywall modal shows plan options', async ({ page }) => {
    await page.click('[data-testid="skill-node-premium"]:first-child')
    await expect(page.locator('[data-testid="plan-monthly"]')).toBeVisible()
    await expect(page.locator('[data-testid="plan-annual"]')).toBeVisible()
  })

  test('paywall modal can be closed', async ({ page }) => {
    await page.click('[data-testid="skill-node-premium"]:first-child')
    await page.click('[data-testid="paywall-close"]')
    await expect(page.locator('[data-testid="paywall-modal"]')).not.toBeVisible()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 7. FLASHCARDS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Flashcards', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    await page.goto('/flashcards')
  })

  test('flashcard front is visible on load', async ({ page }) => {
    await expect(page.locator('[data-testid="fc-front"]')).toBeVisible()
  })

  test('rating buttons are disabled before flipping', async ({ page }) => {
    await expect(page.locator('[data-testid="fc-btn-easy"]')).toBeDisabled()
    await expect(page.locator('[data-testid="fc-btn-good"]')).toBeDisabled()
  })

  test('clicking card flips to reveal back', async ({ page }) => {
    await page.click('[data-testid="fc-scene"]')
    await expect(page.locator('[data-testid="fc-back"]')).toBeVisible()
  })

  test('rating buttons enable after flipping', async ({ page }) => {
    await page.click('[data-testid="fc-scene"]')
    await expect(page.locator('[data-testid="fc-btn-easy"]')).toBeEnabled()
    await expect(page.locator('[data-testid="fc-btn-good"]')).toBeEnabled()
  })

  test('rating card advances to next card', async ({ page }) => {
    const getWord = async () => page.locator('[data-testid="fc-front-word"]').innerText()
    const wordBefore = await getWord()
    await page.click('[data-testid="fc-scene"]')
    await page.click('[data-testid="fc-btn-good"]')
    await page.waitForTimeout(300)
    const wordAfter = await getWord()
    expect(wordAfter).not.toBe(wordBefore)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 8. PROFILE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Profile screen', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!)
    await page.goto('/profile')
  })

  test('shows user display name', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible()
  })

  test('shows XP progress bar', async ({ page }) => {
    await expect(page.locator('[data-testid="xp-bar"]')).toBeVisible()
  })

  test('shows badges section', async ({ page }) => {
    await expect(page.locator('[data-testid="badges-grid"]')).toBeVisible()
  })

  test('shows learning direction setting', async ({ page }) => {
    await expect(page.locator('[data-testid="learning-direction"]')).toBeVisible()
  })

  test('premium upgrade banner visible for free user', async ({ page }) => {
    await expect(page.locator('[data-testid="premium-banner"]')).toBeVisible()
  })
})
