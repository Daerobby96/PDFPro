'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) setError(decodeURIComponent(errorParam))
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google')
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We sent a verification link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
        <Link href="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Google SSO */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400 px-2">or sign up with email</span>
        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            id="fullName" type="text" value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            placeholder="John Doe" required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            placeholder="you@example.com" required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            placeholder="••••••••" minLength={6} required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 6 characters</p>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox" id="terms"
            className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            required
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            I agree to the{' '}
            <a href="#" className="text-primary-500 hover:text-primary-600">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-500 hover:text-primary-600">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Creating account...</>
          ) : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">PDF Tool Pro</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create account</h1>
          <p className="text-gray-600 dark:text-gray-400">Start your free trial today</p>
        </div>
        <Suspense fallback={
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        }>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
