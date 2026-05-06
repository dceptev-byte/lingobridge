'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { useI18nStore } from '../../store/i18nStore'
import { reset as analyticsReset } from '../../lib/analytics/posthog'

interface SettingsSectionProps {
  initialDisplayName: string | null
}

export function SettingsSection({ initialDisplayName }: SettingsSectionProps) {
  const { t } = useI18nStore()
  const router = useRouter()

  const [name, setName] = useState(initialDisplayName ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  async function handleSave() {
    if (saveState === 'saving') return
    setSaveState('saving')

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name }),
      })
      if (res.ok) {
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
        router.refresh()
      } else {
        setSaveState('idle')
      }
    } catch {
      setSaveState('idle')
    }
  }

  async function handleSignOut() {
    analyticsReset()  // disassociate PostHog identity before clearing session
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isDirty = name !== (initialDisplayName ?? '')

  return (
    <div className="flex flex-col gap-3">
      {/* Display name */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex flex-col gap-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t('profile_display_name')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSaveState('idle') }}
            placeholder={t('profile_display_name_placeholder')}
            maxLength={40}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleSave}
            disabled={!isDirty || saveState === 'saving'}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              saveState === 'saved'
                ? 'bg-emerald-500 text-white'
                : isDirty
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saveState === 'saving'
              ? t('profile_saving')
              : saveState === 'saved'
              ? t('profile_saved')
              : t('profile_save')}
          </button>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full bg-white rounded-2xl border border-rose-100 shadow-sm px-4 py-4 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-rose-300"
      >
        {t('profile_sign_out')} →
      </button>
    </div>
  )
}
