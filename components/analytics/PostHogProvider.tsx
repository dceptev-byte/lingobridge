'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { init } from '../../lib/analytics/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const initialised = useRef(false)

  // Initialise once
  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    init()
  }, [])

  // Fire page_view on every route change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      posthog.capture('$pageview', { $current_url: window.location.href })
    } catch {
      // Not yet ready
    }
  }, [pathname])

  return <>{children}</>
}
