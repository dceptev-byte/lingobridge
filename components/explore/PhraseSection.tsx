'use client'

import { useState } from 'react'
import { useI18nStore } from '../../store/i18nStore'
import type { PhraseCategory } from '../../content/explore/vi-hi'

interface PhraseSectionProps {
  category: PhraseCategory
}

export function PhraseSection({ category }: PhraseSectionProps) {
  const { t } = useI18nStore()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  async function handleCopy(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(idx)
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch {
      // clipboard unavailable — silently skip
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Category header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xl" aria-hidden="true">{category.icon}</span>
        <h3 className="font-semibold text-slate-700 text-sm">{category.name}</h3>
      </div>

      {/* Phrase rows */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
        {category.phrases.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => handleCopy(phrase.target, idx)}
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors group"
            title={t('explore_tap_to_copy')}
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-indigo-700 text-sm truncate">
                {phrase.target}
              </p>
              {phrase.targetRoman && (
                <p className="text-xs text-slate-400 mt-0.5 truncate italic">
                  {phrase.targetRoman}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-0.5 truncate">{phrase.native}</p>
            </div>

            {/* Copy indicator */}
            <span
              className={`text-xs font-medium flex-shrink-0 transition-all ${
                copiedIndex === idx
                  ? 'text-emerald-500 opacity-100'
                  : 'text-slate-300 opacity-0 group-hover:opacity-100'
              }`}
            >
              {copiedIndex === idx ? t('explore_copied') : '⎘'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
