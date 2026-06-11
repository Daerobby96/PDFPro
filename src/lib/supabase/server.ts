import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Supabase client for use in Server Components
 * This client runs on the server
 */
export const createClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
