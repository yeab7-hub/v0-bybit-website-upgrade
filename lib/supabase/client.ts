import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      `[v0] Missing Supabase env vars - URL: ${supabaseUrl ? 'SET' : 'MISSING'}, ANON_KEY: ${supabaseAnonKey ? 'SET' : 'MISSING'}`
    )
    // Return a chainable stub that surfaces the real error to the UI
    const notConfiguredError = { message: 'Supabase not configured', status: 500 }
    const chainable: any = new Proxy({}, {
      get() {
        return (..._args: any[]) => {
          const inner: any = new Proxy({}, {
            get(_, p2) {
              if (p2 === 'then') return undefined // not a thenable
              if (p2 === 'data') return null
              if (p2 === 'error') return notConfiguredError
              return (..._a2: any[]) => inner
            }
          })
          // Also make the return awaitable for terminal calls
          inner.then = (resolve: any) => resolve({ data: null, error: notConfiguredError })
          return inner
        }
      }
    })

    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: notConfiguredError }),
        signUp: async () => ({ data: { user: null, session: null }, error: notConfiguredError }),
        signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: notConfiguredError }),
      },
      from: () => chainable,
    } as unknown as SupabaseClient
  }

  // Only cache a real client, never a stub
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}
