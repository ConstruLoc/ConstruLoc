"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedRememberMe = localStorage.getItem("construloc_remember_me")
        const savedEmail = localStorage.getItem("construloc_user_email")

        if (savedRememberMe === "true" && savedEmail) {
          setEmail(savedEmail)
          setRememberMe(true)
        }
      } catch (e) {
        // Silently fail if localStorage is not available
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!email || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha seu email e senha",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Erro no login",
          description:
            error.message === "Invalid login credentials"
              ? "Email ou senha incorretos"
              : "Não foi possível realizar o login. Tente novamente.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Salvar preferências de "lembrar-me"
        if (rememberMe) {
          localStorage.setItem("construloc_remember_me", "true")
          localStorage.setItem("construloc_user_email", email)
        } else {
          localStorage.removeItem("construloc_remember_me")
          localStorage.removeItem("construloc_user_email")
        }

        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: "Não foi possível realizar o login. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gray-900/95 border-orange-500/30 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-orange-400">Login - ConstruLoc</CardTitle>
        <CardDescription className="text-gray-300">Entre com seu email para acessar o sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-orange-400">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700/80 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-orange-400">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700/80 border-gray-600 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember-me" className="text-sm text-gray-300">
              Salvar no dispositivo
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center text-sm text-gray-300">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-orange-400 hover:underline">
              Criar conta
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
