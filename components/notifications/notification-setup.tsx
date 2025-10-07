"use client"

import { useEffect, useState } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, X } from "lucide-react"

export function NotificationSetup() {
  const { user, profile } = useUser()
  const { permission, isSupported, requestPermission, startNotificationService } = useNotifications()
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("notification-banner-dismissed")
    if (dismissed === "true") {
      setIsDismissed(true)
    }
  }, [])

  useEffect(() => {
    // Start notification service when user is authenticated and has admin/operator role
    if (user && profile && (profile.role === "admin" || profile.role === "operador")) {
      if (permission === "granted") {
        console.log("[v0] Starting notification service...")
        const cleanup = startNotificationService()
        return cleanup
      }
    }
  }, [user, profile, permission, startNotificationService])

  const handleDismiss = () => {
    localStorage.setItem("notification-banner-dismissed", "true")
    setIsDismissed(true)
  }

  const handleRequestPermission = async () => {
    try {
      await requestPermission()
      // If permission granted, dismiss the banner
      if (Notification.permission === "granted") {
        handleDismiss()
      }
    } catch (error) {
      console.error("[v0] Error requesting notification permission:", error)
    }
  }

  if (isDismissed) {
    return null
  }

  if (!user || !profile || (profile.role !== "admin" && profile.role !== "operador")) {
    return null
  }

  if (!isSupported) {
    return null // Don't show unsupported message
  }

  if (permission === "denied") {
    return null // Don't show blocked message - it's annoying
  }

  if (permission === "default") {
    return (
      <Card className="border-orange-500/30 bg-gray-800/50 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-orange-400 hover:text-orange-300 transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-orange-500" />
            Ativar Notificações
          </CardTitle>
          <CardDescription className="text-gray-300">
            Receba alertas no navegador quando contratos estiverem prestes a vencer ou já vencidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRequestPermission} className="w-full bg-orange-600 hover:bg-orange-700 transition-all">
            <Bell className="h-4 w-4 mr-2" />
            Ativar Notificações
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
