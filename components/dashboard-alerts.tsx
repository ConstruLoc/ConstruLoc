"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, AlertTriangle, Clock, XCircle, Wrench, TrendingDown } from "lucide-react"
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
  link?: string
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
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const hasFetchedRef = useRef(false)
  const fetchTimeoutRef = useRef<NodeJS.Timeout>()

  const fetchAlerts = useCallback(async () => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    try {
      const { count: availableEquipment } = await supabase
        .from("equipamentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel")

      const { count: maintenanceEquipment } = await supabase
        .from("equipamentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "manutencao")

      const { data: lowStockEquipment } = await supabase
        .from("equipamentos")
        .select("id, nome, quantidade")
        .eq("status", "disponivel")
        .lte("quantidade", 2)
        .gt("quantidade", 0)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: contracts } = await supabase
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

      const expiringContractsList: ExpiringContract[] =
        contracts?.map((contract: any) => {
          const dataFim = new Date(contract.data_fim)
          dataFim.setHours(0, 0, 0, 0)
          const daysUntilExpiry = Math.ceil((dataFim.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          return {
            id: contract.id,
            numero_contrato: contract.numero_contrato,
            cliente_nome: contract.clientes?.nome || "Cliente não encontrado",
            data_fim: contract.data_fim,
            days_until_expiry: daysUntilExpiry,
          }
        }) || []

      const alertsList: Alert[] = []

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

        if (expiredContracts.length > 0) {
          expiredContracts.forEach((contract) => {
            alertsList.push({
              id: `expired-${contract.id}`,
              type: "error",
              title: `Devolução atrasada - ${contract.numero_contrato}`,
              description: `Atrasado há ${Math.abs(contract.days_until_expiry)} dia(s) - ${contract.clienteNome}`,
              icon: <XCircle className="h-5 w-5" />,
              contractId: contract.id,
            })
          })
        }

        if (expiringToday.length > 0) {
          expiringToday.forEach((contract) => {
            alertsList.push({
              id: `today-${contract.id}`,
              type: "error",
              title: `Devolução HOJE - ${contract.numero_contrato}`,
              description: `Cliente: ${contract.clienteNome}`,
              icon: <AlertTriangle className="h-5 w-5" />,
              contractId: contract.id,
            })
          })
        }

        if (expiring1to2Days.length > 0) {
          expiring1to2Days.forEach((contract) => {
            alertsList.push({
              id: `urgent-${contract.id}`,
              type: "warning",
              title: `Devolução em ${contract.days_until_expiry} dia(s)`,
              description: `${contract.numero_contrato} - ${contract.clienteNome}`,
              icon: <Clock className="h-5 w-5" />,
              contractId: contract.id,
            })
          })
        }

        if (expiring3to7Days.length > 0) {
          alertsList.push({
            id: "expiring-soon",
            type: "info",
            title: `${expiring3to7Days.length} devolução(ões) esta semana`,
            description: "Devoluções previstas nos próximos 3-7 dias",
            count: expiring3to7Days.length,
            icon: <Calendar className="h-5 w-5" />,
            link: "/contratos",
          })
        }
      }

      if (maintenanceEquipment && maintenanceEquipment > 0) {
        alertsList.push({
          id: "equipamentos-manutencao",
          type: "warning",
          title: `${maintenanceEquipment} equipamento(s) em manutenção`,
          description: "Equipamentos indisponíveis temporariamente",
          count: maintenanceEquipment,
          icon: <Wrench className="h-5 w-5" />,
          link: "/equipamentos",
        })
      }

      if (lowStockEquipment && lowStockEquipment.length > 0) {
        lowStockEquipment.forEach((equipment: any) => {
          alertsList.push({
            id: `low-stock-${equipment.id}`,
            type: "warning",
            title: `Estoque baixo: ${equipment.nome}`,
            description: `Apenas ${equipment.quantidade} unidade(s) disponível(is)`,
            icon: <TrendingDown className="h-5 w-5" />,
            link: "/equipamentos",
          })
        })
      }

      if (availableEquipment && availableEquipment > 0) {
        alertsList.push({
          id: "equipamentos-disponiveis",
          type: "success",
          title: `${availableEquipment} equipamento(s) disponível(is)`,
          description: "Prontos para nova locação",
          count: availableEquipment,
          icon: <CheckCircle className="h-5 w-5" />,
          link: "/equipamentos",
        })
      }

      setAlerts(alertsList)
    } catch (error) {
      console.error("Error fetching dashboard alerts:", error)
    } finally {
      setLoading(false)
      fetchTimeoutRef.current = setTimeout(() => {
        hasFetchedRef.current = false
      }, 30000) // Allow refetch after 30 seconds
    }
  }, [supabase])

  useEffect(() => {
    fetchAlerts()

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [fetchAlerts])

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
          Alertas e Devoluções
          <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent ml-3" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
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
                  className={`p-4 rounded-lg border ${getAlertStyles(alert.type)} transition-all hover:scale-[1.02] ${alert.contractId || alert.link ? "cursor-pointer" : ""}`}
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

              if (alert.contractId) {
                return (
                  <Link key={alert.id} href={`/contratos/${alert.contractId}`}>
                    {AlertContent}
                  </Link>
                )
              }

              if (alert.link) {
                return (
                  <Link key={alert.id} href={alert.link}>
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
