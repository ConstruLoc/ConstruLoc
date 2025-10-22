"use client"

import { useEffect } from "react"
import { startNotificationScheduler, stopNotificationScheduler } from "@/lib/notifications"

export function NotificationScheduler() {
  useEffect(() => {
    const intervalId = startNotificationScheduler()

    return () => {
      stopNotificationScheduler()
    }
  }, []) // Array de dependências vazio garante que só roda uma vez

  return null
}
