"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      if (typeof window !== "undefined") {
        // Get existing users from localStorage
        const storedUsers = JSON.parse(localStorage.getItem("construloc_users") || "[]")

        // Check if user already exists
        const existingUser = storedUsers.find((u: any) => u.email === email)
        if (existingUser) {
          throw new Error("Este email já está cadastrado")
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          email,
          password,
          name: name || email.split("@")[0],
          createdAt: new Date().toISOString(),
        }

        // Add to users array
        storedUsers.push(newUser)
        localStorage.setItem("construloc_users", JSON.stringify(storedUsers))

        // Auto login the new user
        localStorage.setItem(
          "construloc_current_user",
          JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            loginTime: new Date().toISOString(),
          }),
        )

        router.push("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundColor: "#1a1a1a",
        backgroundImage: "url('/images/fundo-construcao.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center opacity-20">
          <h1 className="text-8xl md:text-9xl font-bold text-white mb-4">ConstruLoc</h1>
          <p className="text-2xl md:text-3xl text-white">Locação de Equipamentos</p>
        </div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="mb-6">
              <img
                src="/images/logo-construloc-sem-fundo.png"
                alt="ConstruLoc Logo"
                className="mx-auto h-24 w-auto"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          </div>

          <Card className="bg-gray-900/95 border-orange-500/30 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-orange-400">Criar Conta - ConstruLoc</CardTitle>
              <CardDescription className="text-gray-300">Crie uma nova conta no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-orange-400">
                    Nome (opcional)
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-700/80 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>

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
                    placeholder="Mínimo 6 caracteres"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700/80 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="repeat-password" className="text-orange-400">
                    Repetir Senha
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    placeholder="Digite a senha novamente"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-gray-700/80 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>

                {error && <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{error}</div>}

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>

                <div className="text-center text-sm text-gray-300">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="text-orange-400 hover:underline">
                    Fazer login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
