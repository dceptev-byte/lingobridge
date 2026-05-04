'use client'

import { useI18nStore } from '../store/i18nStore'

export function useI18n() {
  return useI18nStore()
}
