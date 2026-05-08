'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'
import { useI18n } from '../../../hooks/useI18n'

export default function LoginPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth_error_invalid_email'))
      return
    }
    setLoading(true)
    setError('')
    const { error: sbError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (sbError) {
      setError(t('auth_error_generic'))
    } else {
      setSent(true)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
            {t('auth_magic_link_sent')}
          </h2>
          <p className="text-gray-500 font-body mb-6">{t('auth_magic_link_sub')}</p>
          <button
            onClick={() => setSent(false)}
            className="text-indigo-600 font-body font-medium hover:text-indigo-700 transition-colors"
          >
            {t('btn_back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-extrabold text-indigo-600 mb-1">
            {t('app_name')}
          </h1>
          <p className="font-body text-gray-500 text-sm">{t('app_tagline')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('auth_welcome')}
          </h2>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 font-body font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <GoogleIcon />
            {t('auth_google')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="font-body text-sm text-gray-400">{t('auth_or')}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSignIn} noValidate>
            <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
              {t('auth_email_label')}
            </label>
            <input
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder={t('auth_email_placeholder')}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 font-body text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition mb-3"
              autoComplete="email"
            />
            {error && (
              <p data-testid="auth-error" className="font-body text-sm text-rose-500 mb-3">{error}</p>
            )}
            <button
              data-testid="submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-body font-semibold rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('auth_continue')}
            </button>
          </form>

          {/* Footer */}
          <p className="font-body text-xs text-gray-400 text-center mt-5 leading-relaxed">
            {t('auth_terms')}
          </p>
        </div>

        {/* Sign up link */}
        <p className="font-body text-sm text-gray-500 text-center mt-5">
          {t('auth_no_account')}{' '}
          <Link href="/signup" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            {t('auth_sign_up')}
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
