import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const isAuthRoute = request.nextUrl.pathname === "/" || request.nextUrl.pathname.startsWith("/auth")

  // Redirect logic
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
