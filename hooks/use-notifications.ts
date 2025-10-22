"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface ContractNotification {
  id: string
  numero_contrato: string
  cliente_nome: string
  data_fim: string
  days_until_expiry: number
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === "granted" && isSupported) {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      })
    }
  }

  const checkExpiringContracts = async () => {
    try {
      // Get contracts expiring in the next 7 days or already expired
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)

      const { data: contracts, error } = await supabase
        .from("contratos")
        .select(`
          id,
          numero_contrato,
          data_fim,
          status,
          clientes (nome)
        `)
        .eq("status", "ativo")
        .lte("data_fim", nextWeek.toISOString().split("T")[0])

      if (error) {
        console.error("Error checking contracts:", error)
        return
      }

      if (!contracts || contracts.length === 0) {
        return
      }

      contracts.forEach((contract: any) => {
        const expiryDate = new Date(contract.data_fim)
        const diffTime = expiryDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        let message = ""
        let isUrgent = false

        if (diffDays < 0) {
          message = `Contrato ${contract.numero_contrato} venceu há ${Math.abs(diffDays)} dias`
          isUrgent = true
        } else if (diffDays === 0) {
          message = `Contrato ${contract.numero_contrato} vence hoje!`
          isUrgent = true
        } else if (diffDays <= 3) {
          message = `Contrato ${contract.numero_contrato} vence em ${diffDays} dias`
          isUrgent = true
        } else {
          message = `Contrato ${contract.numero_contrato} vence em ${diffDays} dias`
        }

        // Show only browser notification (no toast)
        showNotification("ConstruLoc - Contrato Vencendo", {
          body: `${message}\nCliente: ${contract.clientes?.nome}`,
          tag: `contract-${contract.id}`,
          requireInteraction: isUrgent,
        })
      })
    } catch (error) {
      console.error("Error in checkExpiringContracts:", error)
    }
  }

  const startNotificationService = () => {
    // Check immediately
    checkExpiringContracts()

    // Check every hour
    const interval = setInterval(checkExpiringContracts, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    checkExpiringContracts,
    startNotificationService,
  }
}
