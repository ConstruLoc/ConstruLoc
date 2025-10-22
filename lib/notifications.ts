import { createClient } from "@/lib/supabase/client"

export interface NotificationData {
  title: string
  body: string
  url?: string
  icon?: string
}

export async function sendPushNotification(data: NotificationData) {
  if (!("Notification" in window)) {
    console.log("[Notifications] Push notifications not supported")
    return false
  }

  if (Notification.permission !== "granted") {
    console.log("[Notifications] Permission not granted")
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready

    await registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/logo.png",
      badge: "/logo.png",
      vibrate: [200, 100, 200],
      data: {
        url: data.url || "/dashboard",
        dateOfArrival: Date.now(),
      },
      actions: [
        {
          action: "open",
          title: "Abrir",
        },
        {
          action: "close",
          title: "Fechar",
        },
      ],
    })

    console.log("[Notifications] Notification sent successfully")
    return true
  } catch (error) {
    console.error("[Notifications] Error sending notification:", error)
    return false
  }
}

export async function checkUpcomingPayments() {
  const supabase = createClient()

  const today = new Date()
  const fiveDaysFromNow = new Date(today)
  fiveDaysFromNow.setDate(today.getDate() + 5)

  const { data: contracts, error } = await supabase
    .from("contratos")
    .select(`
      *,
      clientes (
        nome,
        telefone
      )
    `)
    .gte("data_pagamento", today.toISOString().split("T")[0])
    .lte("data_pagamento", fiveDaysFromNow.toISOString().split("T")[0])
    .eq("status", "ativo")

  if (error) {
    console.error("[Notifications] Error fetching contracts:", error)
    return []
  }

  return contracts || []
}

export async function schedulePaymentNotifications() {
  const contracts = await checkUpcomingPayments()

  for (const contract of contracts) {
    const paymentDate = new Date(contract.data_pagamento)
    const daysUntilPayment = Math.ceil((paymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilPayment <= 5 && daysUntilPayment >= 0) {
      await sendPushNotification({
        title: "Pagamento Próximo",
        body: `O contrato ${contract.numero_contrato} do cliente ${contract.clientes?.nome} vence em ${daysUntilPayment} dia(s). Valor: R$ ${contract.valor_total?.toFixed(2)}`,
        url: `/contratos/${contract.id}`,
      })
    }
  }
}

let schedulerIntervalId: NodeJS.Timeout | null = null

export function startNotificationScheduler() {
  if (typeof window === "undefined") return

  if (schedulerIntervalId !== null) {
    console.log("[Notifications] Scheduler already running, skipping initialization")
    return schedulerIntervalId
  }

  const checkInterval = 60 * 60 * 1000

  const check = async () => {
    const settings = localStorage.getItem("system_settings")
    if (settings) {
      const parsed = JSON.parse(settings)
      if (parsed.notifications_push) {
        await schedulePaymentNotifications()
      }
    }
  }

  check()

  schedulerIntervalId = setInterval(check, checkInterval)

  console.log("[Notifications] Scheduler started - checking every hour")

  return schedulerIntervalId
}

export function stopNotificationScheduler() {
  if (schedulerIntervalId !== null) {
    clearInterval(schedulerIntervalId)
    schedulerIntervalId = null
    console.log("[Notifications] Scheduler stopped")
  }
}
