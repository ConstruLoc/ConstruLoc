"use client"

import { useEffect } from "react"
import { startNotificationScheduler } from "@/lib/notifications"

export function NotificationScheduler() {
  useEffect(() => {
    startNotificationScheduler()
  }, [])

  return null
}
