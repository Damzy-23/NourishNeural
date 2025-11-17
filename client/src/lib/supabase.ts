import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

// Types for better TypeScript support
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
      user_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          age: number | null
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          age?: number | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          age?: number | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
        }
      }
      pantry_items: {
        Row: {
          id: string
          user_id: string
          name: string
          quantity: number
          unit: string | null
          category: string | null
          expiry_date: string | null
          purchase_date: string | null
          estimated_price: number | null
          barcode: string | null
          notes: string | null
          image_url: string | null
          predicted_expiry_date: string | null
          waste_probability: number | null
          freshness_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          quantity?: number
          unit?: string | null
          category?: string | null
          expiry_date?: string | null
          purchase_date?: string | null
          estimated_price?: number | null
          barcode?: string | null
          notes?: string | null
          image_url?: string | null
        }
        Update: {
          name?: string
          quantity?: number
          unit?: string | null
          category?: string | null
          expiry_date?: string | null
          purchase_date?: string | null
          estimated_price?: number | null
          barcode?: string | null
          notes?: string | null
          predicted_expiry_date?: string | null
          waste_probability?: number | null
          freshness_score?: number | null
        }
      }
      grocery_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          store_id: string | null
          status: string
          total_estimated_cost: number | null
          created_at: string
          updated_at: string
        }
      }
      grocery_items: {
        Row: {
          id: string
          list_id: string
          name: string
          quantity: number | null
          unit: string | null
          category: string | null
          estimated_price: number | null
          is_checked: boolean
          notes: string | null
          barcode: string | null
          created_at: string
        }
      }
    }
  }
}
