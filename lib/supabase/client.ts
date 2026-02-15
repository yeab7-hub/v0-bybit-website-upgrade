import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
    // Return a proxy that won't crash the app but logs warnings
    return new Proxy({} as SupabaseClient, {
      get(_, prop) {
        if (prop === 'auth') {
          return {
            getUser: async () => ({ data: { user: null }, error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signOut: async () => ({ error: null }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
            signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
          }
        }
        if (prop === 'from') {
          return () => ({
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }), data: [], error: null }), data: [], error: null }),
            insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            update: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            delete: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          })
        }
        return undefined
      },
    })
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
