import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider as NextThemeProvider } from "@/components/theme-provider"
import { ThemeProvider } from "@/contexts/theme-context"
import { UserProvider } from "@/contexts/user-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "ConstruLoc - Sistema de Gerenciamento de Aluguel",
  description: "Sistema de gerenciamento de locações de equipamentos",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#ea580c",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <ThemeProvider>
            <UserProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <Toaster />
            </UserProvider>
          </ThemeProvider>
        </NextThemeProvider>
      </body>
    </html>
  )
}
