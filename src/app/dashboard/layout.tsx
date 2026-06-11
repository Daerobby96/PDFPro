import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'
import ToasterWrapper from '@/components/ui/ToasterWrapper'
import { FileProvider } from '@/context/FileContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  let subscriptionTier: 'free' | 'pro' | 'team' = 'free'
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', session.user.id)
    .single<{ subscription_tier: 'free' | 'pro' | 'team' }>()

  if (profile?.subscription_tier) {
    subscriptionTier = profile.subscription_tier
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FileProvider>
        <DashboardNav user={session.user} subscriptionTier={subscriptionTier} />
        <main className="pt-16">
          {children}
        </main>
      </FileProvider>
      <ToasterWrapper />
    </div>
  )
}
