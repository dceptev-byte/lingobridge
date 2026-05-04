'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getT, type Lang, type TranslationKeys } from '../lib/i18n'

interface I18nStore {
  lang: Lang
  t: (key: TranslationKeys) => string
  setLang: (lang: Lang) => void
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      lang: 'vi' as Lang,
      t: getT('vi'),
      setLang: (lang: Lang) => set({ lang, t: getT(lang) }),
    }),
    {
      name: 'lb-lang',
      partialize: (state) => ({ lang: state.lang }),
      // After rehydration, sync the t() function with the persisted lang
      onRehydrateStorage: () => (state) => {
        if (state) state.t = getT(state.lang)
      },
    }
  )
)
