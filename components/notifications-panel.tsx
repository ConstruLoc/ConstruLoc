"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notification {
  id: string
  contractId: string
  numeroContrato: string
  clienteNome: string
  title: string
  message: string
  type: "error" | "warning" | "info"
  daysUntilExpiry: number
  dataFim: Date
  read: boolean
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const supabase = createClient()

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: contracts, error } = await supabase
          .from("contratos")
          .select("id, numero_contrato, data_fim, clientes(nome)")
          .not("status", "in", "(cancelado,finalizado)")
          .order("data_fim", { ascending: true })

        const newNotifications: Notification[] = []

        if (contracts) {
          contracts.forEach((contract: any) => {
            const dataFim = new Date(contract.data_fim)
            dataFim.setHours(0, 0, 0, 0)
            const daysUntilExpiry = Math.ceil((dataFim.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

            let notification: Notification | null = null

            if (daysUntilExpiry < 0) {
              // Contrato vencido
              notification = {
                id: contract.id,
                contractId: contract.id,
                numeroContrato: contract.numero_contrato,
                clienteNome: contract.clientes?.nome || "Cliente não encontrado",
                title: "Contrato atrasado!",
                message: `Venceu há ${Math.abs(daysUntilExpiry)} dia(s)`,
                type: "error",
                daysUntilExpiry,
                dataFim,
                read: false,
              }
            } else if (daysUntilExpiry === 0) {
              // Vence hoje
              notification = {
                id: contract.id,
                contractId: contract.id,
                numeroContrato: contract.numero_contrato,
                clienteNome: contract.clientes?.nome || "Cliente não encontrado",
                title: "Vence HOJE!",
                message: "Contrato vence hoje",
                type: "error",
                daysUntilExpiry,
                dataFim,
                read: false,
              }
            } else if (daysUntilExpiry <= 2) {
              // Vence em 1-2 dias
              notification = {
                id: contract.id,
                contractId: contract.id,
                numeroContrato: contract.numero_contrato,
                clienteNome: contract.clientes?.nome || "Cliente não encontrado",
                title: `Falta ${daysUntilExpiry} dia(s) para vencer`,
                message: "Atenção: vencimento próximo",
                type: "warning",
                daysUntilExpiry,
                dataFim,
                read: false,
              }
            } else if (daysUntilExpiry <= 7) {
              // Vence em 3-7 dias
              notification = {
                id: contract.id,
                contractId: contract.id,
                numeroContrato: contract.numero_contrato,
                clienteNome: contract.clientes?.nome || "Cliente não encontrado",
                title: `Vence em ${daysUntilExpiry} dias`,
                message: "Vencimento esta semana",
                type: "info",
                daysUntilExpiry,
                dataFim,
                read: false,
              }
            }

            if (notification) {
              newNotifications.push(notification)
            }
          })
        }

        setNotifications(newNotifications)
        setLoading(false)
      } catch (error) {
        console.error("Error in fetchNotifications:", error)
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getDaysMessage = (days: number) => {
    if (days < 0) {
      return `Venceu há ${Math.abs(days)} dia(s)`
    } else if (days === 0) {
      return "Vence hoje"
    } else if (days === 1) {
      return "Vence amanhã"
    } else {
      return `Falta ${days} dia(s)`
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-sidebar-foreground hover:bg-sidebar-accent">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-600 hover:bg-orange-700">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 max-h-[500px] overflow-hidden flex flex-col bg-gray-900 border-gray-800"
        align="end"
      >
        <Card className="border-0 shadow-none flex-1 flex flex-col bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-white">
              Notificações
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-orange-600 text-white hover:bg-orange-700">
                  {unreadCount} nova(s)
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 overflow-y-auto flex-1">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma notificação</p>
            ) : (
              notifications.map((notification) => (
                <Link key={notification.id} href={`/contratos/${notification.contractId}`}>
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 transition-all hover:bg-gray-750 hover:border-gray-600 cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{notification.numeroContrato}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{notification.clienteNome}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Vencimento: {format(notification.dataFim, "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs font-medium text-gray-300 mt-1">
                          {getDaysMessage(notification.daysUntilExpiry)}
                        </p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
