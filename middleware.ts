import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Will re-enable once Supabase package issue is resolved
  return
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
