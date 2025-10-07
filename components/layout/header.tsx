"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, LogOut, User, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

interface HeaderProps {
  title?: string
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("construloc_current_user")
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error("Error reading user data:", error)
      }
    }
  }, [])

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("construloc_current_user")
      localStorage.removeItem("construloc_remember_me")
      localStorage.removeItem("construloc_user_email")
    }
    router.push("/auth/login")
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.slice(0, 2).toUpperCase() || "AD"
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/images/logo-construloc-sem-fundo.png"
            alt="ConstruLoc"
            width={120}
            height={48}
            className="object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-orange-500">Sistema de Gerenciamento</h1>
            <p className="text-sm text-gray-400">Locações de equipamentos</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white hover:bg-gray-700">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Administrador"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || "admin@construloc.com"}</p>
                  <p className="text-xs leading-none text-muted-foreground">Administrador</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
