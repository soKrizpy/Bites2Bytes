import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fetch the user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Unauthenticated users trying to access protected routes
  if (
    !user &&
    (pathname.startsWith('/admin') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/student'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated user role routing
  if (user) {
    const role = user.user_metadata?.role || ''

    if (pathname.startsWith('/admin') && role !== 'admin') {
       return NextResponse.redirect(new URL(`/${role || 'student'}`, request.url))
    }
    if (pathname.startsWith('/teacher') && role !== 'teacher' && role !== 'admin') {
       return NextResponse.redirect(new URL(`/${role || 'admin'}`, request.url))
    }
    if (pathname.startsWith('/student') && role !== 'student' && role !== 'admin') {
       return NextResponse.redirect(new URL(`/${role || 'admin'}`, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
