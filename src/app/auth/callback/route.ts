import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  if (code) {
    const supabase = createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      )
    }

    // New user via Google SSO - ensure profile exists
    if (data?.user) {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!existingProfile) {
          const profileData = {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || 
                       data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || 
                        data.user.user_metadata?.picture || null,
            subscription_tier: 'free' as const,
          }
          // @ts-ignore - Supabase types issue with createServerClient
          await supabase.from('profiles').insert([profileData])
        }
      } catch (profileError) {
        // Profile creation failed, but still redirect to dashboard
        console.error('Profile creation error:', profileError)
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
