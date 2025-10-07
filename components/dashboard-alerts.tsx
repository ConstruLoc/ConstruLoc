"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/contexts/user-context"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, AlertTriangle, Clock, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Alert {
  id: string
  type: "success" | "warning" | "error" | "info"
  title: string
  description: string
  count?: number
  icon: React.ReactNode
  contractId?: string
}

interface ExpiringContract {
  id: string
  numero_contrato: string
  cliente_nome: string
  data_fim: string
  days_until_expiry: number
}

export function DashboardAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [expiringContracts, setExpiringContracts] = useState<ExpiringContract[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useUser()
  const supabase = createClient()

  useEffect(() => {
    console.log("[v0] DashboardAlerts mounted, fetching alerts...")
    fetchAlerts()
  }, [user, profile])

  const fetchAlerts = async () => {
    try {
      console.log("[v0] Starting fetchAlerts...")

      // Count available equipment
      const { count: availableEquipment, error: equipmentError } = await supabase
        .from("equipamentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel")

      console.log("[v0] Available equipment count:", availableEquipment, "Error:", equipmentError)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      console.log("[v0] Today's date:", today)

      const { data: contracts, error: contractsError } = await supabase
        .from("contratos")
        .select(`
          id,
          numero_contrato,
          data_fim,
          clientes (
            nome
          )
        `)
        .not("status", "in", "(cancelado,finalizado)")
        .order("data_fim")

      console.log("[v0] Fetched contracts:", contracts, "Error:", contractsError)
      console.log("[v0] Number of contracts:", contracts?.length || 0)

      const expiringContractsList: ExpiringContract[] =
        contracts?.map((contract: any) => {
          const dataFim = new Date(contract.data_fim)
          dataFim.setHours(0, 0, 0, 0)
          const daysUntilExpiry = Math.ceil((dataFim.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          console.log("[v0] Contract:", contract.numero_contrato, "Days until expiry:", daysUntilExpiry)

          return {
            id: contract.id,
            numero_contrato: contract.numero_contrato,
            cliente_nome: contract.clientes?.nome || "Cliente não encontrado",
            data_fim: contract.data_fim,
            days_until_expiry: daysUntilExpiry,
          }
        }) || []

      console.log("[v0] Expiring contracts list:", expiringContractsList)

      const alertsList: Alert[] = []

      // Process expiring contracts and create specific notifications
      if (expiringContractsList.length > 0) {
        const expiredContracts: any[] = []
        const expiringToday: any[] = []
        const expiring1to2Days: any[] = []
        const expiring3to7Days: any[] = []

        expiringContractsList.forEach((contract: any) => {
          const daysUntilExpiry = contract.days_until_expiry

          const contractInfo = {
            ...contract,
            clienteNome: contract.cliente_nome,
          }

          if (daysUntilExpiry < 0) {
            expiredContracts.push(contractInfo)
          } else if (daysUntilExpiry === 0) {
            expiringToday.push(contractInfo)
          } else if (daysUntilExpiry <= 2) {
            expiring1to2Days.push(contractInfo)
          } else if (daysUntilExpiry <= 7) {
            expiring3to7Days.push(contractInfo)
          }
        })

        // Create alerts for expired contracts
        if (expiredContracts.length > 0) {
          expiredContracts.forEach((contract) => {
            alertsList.push({
              id: `expired-${contract.id}`,
              type: "error",
              title: `Contrato ${contract.numero_contrato} está atrasado!`,
              description: `Venceu há ${Math.abs(contract.days_until_expiry)} dia(s) - ${contract.clienteNome}`,
              icon: <XCircle className="h-5 w-5" />,
              contractId: contract.id,
            })
          })
        }

        // Create alerts for contracts expiring today
        if (expiringToday.length > 0) {
          expiringToday.forEach((contract) => {
            alertsList.push({
              id: `today-${contract.id}`,
              type: "error",
              title: `Contrato ${contract.numero_contrato} vence HOJE!`,
              description: `Cliente: ${contract.clienteNome}`,
              icon: <AlertTriangle className="h-5 w-5" />,
              contractId: contract.id,
            })
          })
        }

        // Create alerts for contracts expiring in 1-2 days
        if (expiring1to2Days.length > 0) {
          expiring1to2Days.forEach((contract) => {
            alertsList.push({
              id: `urgent-${contract.id}`,
              type: "warning",
              title: `Falta ${contract.days_until_expiry} dia(s) para vencer`,
              description: `Contrato ${contract.numero_contrato} - ${contract.clienteNome}`,
              icon: <Clock className="h-5 w-5" />,
              contractId: contract.id,
            })
          })
        }

        // Create summary alert for contracts expiring in 3-7 days
        if (expiring3to7Days.length > 0) {
          alertsList.push({
            id: "expiring-soon",
            type: "info",
            title: `${expiring3to7Days.length} contrato(s) vencem esta semana`,
            description: "Vence nos próximos 3-7 dias",
            count: expiring3to7Days.length,
            icon: <Calendar className="h-5 w-5" />,
          })
        }
      }

      // Add alert for available equipment
      if (availableEquipment && availableEquipment > 0) {
        alertsList.push({
          id: "equipamentos-disponiveis",
          type: "success",
          title: `${availableEquipment} equipamento(s) disponível(is)`,
          description: "Prontos para nova locação",
          count: availableEquipment,
          icon: <CheckCircle className="h-5 w-5" />,
        })
      }

      console.log("[v0] Final alerts list:", alertsList)
      console.log("[v0] Total alerts:", alertsList.length)

      setAlerts(alertsList)
      setExpiringContracts(expiringContractsList)
    } catch (error) {
      console.error("[v0] Error fetching dashboard alerts:", error)
    } finally {
      setLoading(false)
      console.log("[v0] Finished fetching alerts, loading set to false")
    }
  }

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-500 bg-red-500/10"
      case "warning":
        return "border-orange-500 bg-orange-500/10"
      case "info":
        return "border-blue-500 bg-blue-500/10"
      case "success":
      default:
        return "border-emerald-500 bg-emerald-500/10"
    }
  }

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-400"
      case "warning":
        return "text-orange-400"
      case "info":
        return "text-blue-400"
      case "success":
      default:
        return "text-emerald-400"
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas e Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <span className="text-slate-400">Carregando alertas...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas e Notificações
          <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent ml-3" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="p-4 rounded-lg border border-slate-600 bg-slate-700/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-sm text-white">Tudo em ordem!</p>
                  <p className="text-xs text-slate-400 mt-1">Nenhum alerta no momento</p>
                </div>
              </div>
            </div>
          ) : (
            alerts.map((alert) => {
              const AlertContent = (
                <div
                  className={`p-4 rounded-lg border ${getAlertStyles(alert.type)} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 ${getAlertTextColor(alert.type)}`}>{alert.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white">{alert.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                    </div>
                    {alert.count !== undefined && alert.count > 0 && (
                      <Badge
                        variant={alert.type === "error" ? "destructive" : "secondary"}
                        className="bg-orange-600 text-white"
                      >
                        {alert.count}
                      </Badge>
                    )}
                  </div>
                </div>
              )

              // If there is a contractId, make the alert clickable
              if (alert.contractId) {
                return (
                  <Link key={alert.id} href={`/contratos/${alert.contractId}`}>
                    {AlertContent}
                  </Link>
                )
              }

              return <div key={alert.id}>{AlertContent}</div>
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
