"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, LogOut, User, Settings, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

interface HeaderProps {
  title?: string
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const notificationsButtonRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target)
      ) {
        console.log("[v0] Closing profile menu - clicked outside")
        setShowProfileMenu(false)
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(target)
      ) {
        console.log("[v0] Closing notifications - clicked outside")
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = () => {
    console.log("[v0] Sign out clicked")
    if (typeof window !== "undefined") {
      localStorage.removeItem("construloc_current_user")
      localStorage.removeItem("construloc_remember_me")
      localStorage.removeItem("construloc_user_email")
    }
    router.push("/auth/login")
  }

  const handleNavigateToProfile = () => {
    console.log("[v0] Navigate to profile clicked")
    setShowProfileMenu(false)
    router.push("/perfil")
  }

  const handleNavigateToSettings = () => {
    console.log("[v0] Navigate to settings clicked")
    setShowProfileMenu(false)
    router.push("/configuracoes")
  }

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("[v0] Notifications button clicked, current state:", showNotifications)
    const newState = !showNotifications
    setShowNotifications(newState)
    setShowProfileMenu(false)
    console.log("[v0] Notifications new state:", newState)
  }

  const toggleProfileMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("[v0] Profile menu button clicked, current state:", showProfileMenu)
    const newState = !showProfileMenu
    setShowProfileMenu(newState)
    setShowNotifications(false)
    console.log("[v0] Profile menu new state:", newState)
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

  console.log("[v0] Header render - showProfileMenu:", showProfileMenu, "showNotifications:", showNotifications)

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-orange-500">ConstruLoc</h1>
            <p className="text-sm text-gray-400">Locações de equipamentos</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationsRef}>
            <Button
              ref={notificationsButtonRef}
              variant="ghost"
              size="sm"
              className="relative text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={toggleNotifications}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl"
                style={{
                  zIndex: 99999,
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "8px",
                }}
              >
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Notificações</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotifications(false)
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  <div className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                    <p className="text-sm text-white font-medium">Contrato próximo do vencimento</p>
                    <p className="text-xs text-gray-400 mt-1">Contrato #123 vence em 3 dias</p>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                    <p className="text-sm text-white font-medium">Novo equipamento disponível</p>
                    <p className="text-xs text-gray-400 mt-1">Betoneira 400L está disponível para locação</p>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                    <p className="text-sm text-white font-medium">Pagamento recebido</p>
                    <p className="text-xs text-gray-400 mt-1">Pagamento de R$ 450,00 confirmado</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileMenuRef}>
            <Button
              ref={profileButtonRef}
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0"
              onClick={toggleProfileMenu}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-orange-500 text-white font-medium">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl"
                style={{
                  zIndex: 99999,
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "8px",
                }}
              >
                <div className="p-3 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{user?.name || "Administrador"}</p>
                  <p className="text-xs text-gray-400 mt-1">{user?.email || "admin@construloc.com"}</p>
                  <p className="text-xs text-gray-400">Administrador</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNavigateToProfile()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Perfil</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNavigateToSettings()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </button>
                </div>
                <div className="border-t border-gray-700 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSignOut()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
