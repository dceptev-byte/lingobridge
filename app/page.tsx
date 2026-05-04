'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18nStore } from '../store/i18nStore'
import { createClient } from '../lib/supabase/client'
import type { Lang } from '../lib/i18n'

const LANGUAGES: { code: Lang; native: string; label: string; flag: string; learn: string }[] = [
  {
    code: 'vi',
    native: 'Tiếng Việt',
    label: 'Vietnamese',
    flag: '🇻🇳',
    learn: 'Học tiếng Hindi',
  },
  {
    code: 'hi',
    native: 'हिंदी',
    label: 'Hindi',
    flag: '🇮🇳',
    learn: 'वियतनामी सीखें',
  },
]

export default function WelcomePage() {
  const { lang, setLang, t } = useI18nStore()
  const [starting, setStarting] = useState(false)
  const [showDev, setShowDev] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Redirect already-authenticated users straight to the app
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/home')
    })
  }, [])

  async function handleStart() {
    setStarting(true)
    const { data: { session } } = await supabase.auth.getSession()
    router.push(session ? '/home' : '/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-700 via-indigo-600 to-indigo-500 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-white mb-3 tracking-tight">
          {t('app_name')}
        </h1>
        <p className="font-body text-indigo-200 text-lg">{t('app_tagline')}</p>
      </div>

      {/* Language picker */}
      <div className="w-full max-w-sm mb-3">
        <p className="font-body text-indigo-200 text-sm text-center mb-3 uppercase tracking-widest">
          I speak
        </p>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`
                flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600
                ${lang === l.code
                  ? 'bg-white border-white shadow-lg scale-105'
                  : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'}
              `}
            >
              <span className="text-3xl">{l.flag}</span>
              <span className={`font-display text-lg font-bold ${lang === l.code ? 'text-indigo-700' : 'text-white'}`}>
                {l.native}
              </span>
              <span className={`font-body text-xs ${lang === l.code ? 'text-indigo-400' : 'text-indigo-200'}`}>
                {l.learn}
              </span>
            </button>
          ))}
        </div>

        {/* Dev mode toggle */}
        <div className="text-center mt-3">
          {showDev ? (
            <button
              onClick={() => setLang('en')}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-body transition-all
                focus:outline-none focus:ring-2 focus:ring-white
                ${lang === 'en'
                  ? 'bg-white border-white text-indigo-700 font-semibold'
                  : 'bg-white/10 border-white/20 text-indigo-200 hover:bg-white/20'}
              `}
            >
              <span>🔧</span> English (dev mode)
            </button>
          ) : (
            <button
              onClick={() => setShowDev(true)}
              className="font-body text-xs text-indigo-300 hover:text-indigo-100 transition-colors"
            >
              Builder mode
            </button>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm mt-6">
        <button
          onClick={handleStart}
          disabled={starting}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display text-xl font-bold rounded-2xl py-4 px-8 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-indigo-600"
        >
          {starting ? t('loading') : t('btn_start')}
        </button>
      </div>

      {/* Footer */}
      <p className="font-body text-indigo-300 text-xs mt-10 text-center">
        {t('auth_terms')}
      </p>
    </div>
  )
}
