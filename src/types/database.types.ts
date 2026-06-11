/**
 * Database types generated from Supabase
 * 
 * To regenerate:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link project: supabase link --project-ref YOUR_PROJECT_REF
 * 4. Generate: supabase gen types typescript --linked > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'team'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'team'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'team'
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'pro' | 'team'
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan: 'free' | 'pro' | 'team'
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro' | 'team'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pdf_history: {
        Row: {
          id: string
          user_id: string
          tool_used: string
          file_name: string
          file_size: number
          pages_count: number | null
          processing_time: number | null
          success: boolean
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_used: string
          file_name: string
          file_size: number
          pages_count?: number | null
          processing_time?: number | null
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_used?: string
          file_name?: string
          file_size?: number
          pages_count?: number | null
          processing_time?: number | null
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
      }
      usage_stats: {
        Row: {
          id: string
          user_id: string
          month: string
          pdf_count: number
          total_size: number
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          pdf_count?: number
          total_size?: number
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          pdf_count?: number
          total_size?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
