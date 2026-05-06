'use client'

import { useState } from 'react'
import { CultureCard } from './CultureCard'
import { PhraseSection } from './PhraseSection'
import { useI18nStore } from '../../store/i18nStore'
import type { ExploreContent } from '../../content/explore/vi-hi'

interface ExploreClientProps {
  content: ExploreContent
}

type Tab = 'culture' | 'phrases'

export function ExploreClient({ content }: ExploreClientProps) {
  const { t } = useI18nStore()
  const [tab, setTab] = useState<Tab>('culture')

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="sticky top-14 lg:top-0 z-10 bg-slate-50 border-b border-slate-200 px-4">
        <div className="flex max-w-lg mx-auto">
          {(['culture', 'phrases'] as Tab[]).map((t_) => (
            <button
              key={t_}
              onClick={() => setTab(t_)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                tab === t_
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t_ === 'culture' ? t('explore_culture') : t('explore_phrases')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto w-full px-4 py-5 pb-24 flex flex-col gap-4">
        {tab === 'culture' &&
          content.cultureCards.map((card, i) => (
            <CultureCard key={i} card={card} />
          ))}

        {tab === 'phrases' &&
          content.phraseCategories.map((cat, i) => (
            <PhraseSection key={i} category={cat} />
          ))}
      </div>
    </div>
  )
}
