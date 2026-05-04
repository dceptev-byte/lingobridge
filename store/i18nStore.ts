'use client'

import { create } from 'zustand'
import { getT, type Lang, type TranslationKeys } from '../lib/i18n'

interface I18nStore {
  lang: Lang
  t: (key: TranslationKeys) => string
  setLang: (lang: Lang) => void
}

export const useI18nStore = create<I18nStore>((set) => ({
  lang: 'vi',
  t: getT('vi'),
  setLang: (lang) => set({ lang, t: getT(lang) }),
}))
