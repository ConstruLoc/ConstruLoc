import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  try {
    console.log("[v0] Middleware: Processing request for", request.nextUrl.pathname)

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[v0] Supabase environment variables not configured")
      // Return without auth check if Supabase is not configured
      return supabaseResponse
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Middleware: User authenticated:", !!user, "Path:", request.nextUrl.pathname)

    // Check if user is trying to access protected routes
    const isProtectedRoute =
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/equipamentos") ||
      request.nextUrl.pathname.startsWith("/clientes") ||
      request.nextUrl.pathname.startsWith("/contratos") ||
      request.nextUrl.pathname.startsWith("/categorias") ||
      request.nextUrl.pathname.startsWith("/catalogo") ||
      request.nextUrl.pathname.startsWith("/pagamentos") ||
      request.nextUrl.pathname.startsWith("/relatorios") ||
      request.nextUrl.pathname.startsWith("/configuracoes") ||
      request.nextUrl.pathname.startsWith("/perfil")

    const isAuthRoute =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.startsWith("/register")

    // Redirect logic
    if (!user && isProtectedRoute) {
      console.log("[v0] Middleware: Redirecting to login (no user, protected route)")
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    if (user && isAuthRoute && request.nextUrl.pathname === "/") {
      console.log("[v0] Middleware: Redirecting to dashboard (user authenticated, on login page)")
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    console.log("[v0] Middleware: Allowing request to proceed")
    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    // Return a valid response even if there's an error
    return NextResponse.next({
      request,
    })
  }
}
