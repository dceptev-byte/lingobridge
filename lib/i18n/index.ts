import { en } from './en'
import { vi } from './vi'
import { hi } from './hi'
import type { TranslationKeys } from './en'

export type Lang = 'vi' | 'hi' | 'en'
export type { TranslationKeys }

const translations: Record<Lang, Record<TranslationKeys, string>> = { en, vi, hi }

export function getT(lang: Lang) {
  return (key: TranslationKeys): string =>
    translations[lang][key] ?? translations.en[key] ?? key
}
