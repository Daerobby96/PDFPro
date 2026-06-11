import { createClientComponentClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Supabase client for use in Client Components
 * This client runs in the browser
 */
export const createClient = () => {
  return createClientComponentClient<Database>()
}
