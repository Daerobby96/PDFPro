"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, Check, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Plan {
  id: 'free' | 'pro' | 'team'
  name: string
  price: string
  period: string
  description: string
  features: string[]
  ctaText: string
  color: string
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out our basic PDF tools.',
    features: [
      '10 PDFs per month',
      'Max 10 MB file size',
      'Basic split, merge and rotate tools',
      'Email support',
    ],
    ctaText: 'Current Plan',
    color: 'slate',
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$19',
    period: '/month',
    description: 'For professionals who need unlimited access.',
    features: [
      'Unlimited PDF processing',
      'Max 100 MB file size',
      'All tools included (Convert, Protect, Compress)',
      'Priority customer support',
      'Batch processing options',
      'API access keys',
    ],
    ctaText: 'Upgrade to Pro',
    color: 'blue',
  },
  {
    id: 'team',
    name: 'Team',
    price: '$49',
    period: '/month',
    description: 'Collaborate with your team members.',
    features: [
      'Everything in Professional',
      'Up to 5 team members',
      'Shared team workspace & history',
      'Dedicated admin dashboard',
      '24/7 Premium phone support',
      'Custom branding & templates',
    ],
    ctaText: 'Upgrade to Team',
    color: 'purple',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [user, setUser] = useState<any | null>(null)
  const [currentTier, setCurrentTier] = useState<string>('free')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [fetchingUser, setFetchingUser] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          
          // Get subscription tier
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', session.user.id)
            .single()
          
          if (profile?.subscription_tier) {
            setCurrentTier(profile.subscription_tier)
          }
        }
      } catch (err) {
        console.error('Error fetching user tier:', err)
      } finally {
        setFetchingUser(false)
      }
    }
    loadUser()
  }, [])

  const handleUpgrade = async (planId: 'free' | 'pro' | 'team') => {
    if (!user) {
      router.push('/signup')
      return
    }

    if (planId === currentTier) {
      toast({
        title: "Already on this plan",
        description: `You are already subscribed to the ${planId.toUpperCase()} plan.`,
      })
      return
    }

    setLoadingPlan(planId)
    try {
      // 1. Update Profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_tier: planId })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 2. Update/Insert Subscriptions table
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingSub) {
        await supabase
          .from('subscriptions')
          .update({
            plan: planId,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: planId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
      }

      setCurrentTier(planId)
      toast({
        title: "Plan updated successfully!",
        description: `Welcome to the ${planId.toUpperCase()} subscription!`,
      })
      router.refresh()
    } catch (err: any) {
      toast({
        title: "Upgrade failed",
        description: err.message || "An unexpected error occurred during upgrade.",
        variant: "destructive"
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pb-16">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">PDF Tool Pro</span>
          </Link>
          
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Pricing Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 mb-4 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          Choose the best plan for your documents
        </div>
        <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="max-w-xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Unlock advanced tools like Conversion, Encryption, Compression, and more. No hidden fees.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.id
          const isPro = plan.id === 'pro'
          
          return (
            <div 
              key={plan.id}
              className={`bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border-2 transition-all flex flex-col justify-between relative
                ${isPro ? 'border-primary-500 scale-105 shadow-md' : 'border-slate-200 dark:border-slate-700'}
                ${isCurrent ? 'ring-4 ring-green-500/20' : ''}`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 min-h-[40px]">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loadingPlan !== null || fetchingUser}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex justify-center items-center gap-2
                    ${isCurrent 
                      ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900 cursor-default'
                      : plan.id === 'pro'
                        ? 'bg-primary-500 hover:bg-primary-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-950 dark:text-white'
                    }`}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : isCurrent ? (
                    'Current Active Plan'
                  ) : (
                    plan.ctaText
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
