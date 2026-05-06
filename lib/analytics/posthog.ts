/**
 * PostHog analytics helpers.
 * All functions are safe to call during SSR — they no-op when window is absent.
 */
import posthog from 'posthog-js'

// ── Typed event catalogue ──────────────────────────────────────────────────

export type AnalyticsEvent =
  | 'sign_up'
  | 'lesson_complete'
  | 'lesson_abandoned'
  | 'flashcard_rated'
  | 'flashcard_session_complete'
  | 'streak_extended'
  | 'streak_broken'
  | 'milestone_reached'
  | 'level_up'
  | 'explore_tab_switched'
  | 'phrase_copied'

export interface EventProperties {
  sign_up: {
    native_lang: string
    method: 'google' | 'magic_link'
  }
  lesson_complete: {
    lesson_id: string
    lesson_slug: string
    xp_earned: number
    accuracy: number
    hearts_remaining: number
  }
  lesson_abandoned: {
    lesson_id: string
    lesson_slug: string
    exercise_index: number
  }
  flashcard_rated: {
    card_id: string
    rating: 0 | 1 | 2 | 3   // Again / Hard / Good / Easy
    rating_label: string
    new_interval_days: number
  }
  flashcard_session_complete: {
    cards_reviewed: number
  }
  streak_extended: {
    streak_current: number
  }
  streak_broken: {
    previous_streak: number
  }
  milestone_reached: {
    streak_days: number
    gems_awarded: number
  }
  level_up: {
    new_level: string
    total_xp: number
  }
  explore_tab_switched: {
    tab: 'culture' | 'phrases'
  }
  phrase_copied: {
    phrase: string
  }
}

// ── Core wrappers ──────────────────────────────────────────────────────────

export function capture<E extends AnalyticsEvent>(
  event: E,
  properties?: EventProperties[E],
): void {
  if (typeof window === 'undefined') return
  try {
    posthog.capture(event, properties as Record<string, unknown>)
  } catch {
    // Not yet initialised — swallow silently
  }
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    posthog.identify(userId, traits)
  } catch {
    // Not yet initialised — swallow silently
  }
}

export function reset(): void {
  if (typeof window === 'undefined') return
  try {
    posthog.reset()
  } catch {}
}

export function init(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
  if (!key || typeof window === 'undefined') return

  posthog.init(key, {
    api_host: host,
    capture_pageview: false,        // we fire page_view manually on route change
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    autocapture: false,             // keep event log clean; we capture explicitly
  })
}
