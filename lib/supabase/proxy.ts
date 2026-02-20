import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // If env vars are missing, just pass through
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Admin routes -- redirect to admin login if not authenticated or not admin
    const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'
    const isAdminApi = pathname.startsWith('/api/admin')

    if ((isAdminRoute || isAdminApi) && !user) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // For admin routes, also verify the user has admin role
    if ((isAdminRoute || isAdminApi) && user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
        if (!isAdmin) {
          if (isAdminApi) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          }
          const url = request.nextUrl.clone()
          url.pathname = '/trade'
          return NextResponse.redirect(url)
        }
      } catch {
        // If profile check fails, allow through -- the page/API will handle auth
        // This prevents middleware crashes from blocking admin access
      }
    }

    // User protected routes -- redirect to user login if not authenticated
    const protectedPaths = ['/wallet', '/kyc', '/support', '/dashboard']
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path))
    if (isProtected && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch {
    // If Supabase connection fails, allow the request through
    return supabaseResponse
  }
}
