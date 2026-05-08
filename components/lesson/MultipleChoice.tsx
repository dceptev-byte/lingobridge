'use client'

import { useI18nStore } from '../../store/i18nStore'

export type MCData = {
  char: string
  charRoman?: string
  promptKey?: string
  options: { vi: string[]; hi: string[]; en: string[] }
  correctIndex: number
}

interface MultipleChoiceProps {
  data: MCData
  selectedIndex: number | null
  onSelect: (index: number) => void
  phase: 'answering' | 'feedback'
  isCorrect: boolean
}

export function MultipleChoice({ data, selectedIndex, onSelect, phase, isCorrect }: MultipleChoiceProps) {
  const { lang, t } = useI18nStore()

  const options = data.options[lang as 'vi' | 'hi' | 'en'] ?? data.options.en

  function getButtonStyle(i: number): string {
    const base = 'w-full text-left px-4 py-3.5 rounded-2xl border-2 font-body font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400'

    if (phase === 'answering') {
      if (selectedIndex === i)
        return `${base} bg-indigo-50 border-indigo-400 text-indigo-800`
      return `${base} bg-white border-gray-200 text-gray-800 hover:border-indigo-200 hover:bg-indigo-50/40`
    }

    // feedback phase — show result
    if (i === data.correctIndex)
      return `${base} bg-emerald-50 border-emerald-400 text-emerald-800`
    if (selectedIndex === i && !isCorrect)
      return `${base} bg-rose-50 border-rose-400 text-rose-800`
    return `${base} bg-white border-gray-100 text-gray-400`
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Character card */}
      <div className="bg-indigo-50 rounded-2xl py-8 px-6 text-center mb-2">
        <p className="font-display text-4xl font-bold text-indigo-800 leading-tight mb-2">
          {data.char}
        </p>
        {data.charRoman && (
          <p className="font-body text-indigo-400 text-base">{data.charRoman}</p>
        )}
      </div>

      <p className="font-body text-sm font-semibold text-gray-500 text-center uppercase tracking-widest">
        {t('lesson_select_meaning')}
      </p>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((option, i) => (
          <button
            key={i}
            data-testid="mc-option"
            data-correct={i === data.correctIndex ? 'true' : 'false'}
            onClick={() => phase === 'answering' && onSelect(i)}
            disabled={phase === 'feedback'}
            className={getButtonStyle(i)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
