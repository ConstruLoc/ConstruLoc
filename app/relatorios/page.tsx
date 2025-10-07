"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RevenueChart } from "@/components/reports/revenue-chart"
import { EquipmentUtilization } from "@/components/reports/equipment-utilization"
import { FileText, DollarSign, TrendingUp, Users, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ReportStats {
  totalContracts: number
  activeRevenue: number
  totalRevenue: number
  totalClients: number
  paidContracts: number
  paidRevenue: number
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalContracts: 0,
    activeRevenue: 0,
    totalRevenue: 0,
    totalClients: 0,
    paidContracts: 0,
    paidRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      console.log("[v0] Starting fetchStats in parallel...")

      // Execute all queries in parallel for better performance
      const [contractsCountResult, activeContractsResult, allContractsResult, clientsCountResult, paidPaymentsResult] =
        await Promise.all([
          supabase.from("contratos").select("*", { count: "exact", head: true }),
          supabase.from("contratos").select("valor_total").eq("status", "ativo"),
          supabase.from("contratos").select("valor_total"),
          supabase.from("clientes").select("*", { count: "exact", head: true }),
          supabase.from("pagamentos").select("valor, contratos(numero_contrato)").eq("status", "pago"),
        ])

      const activeRevenue = activeContractsResult.data?.reduce((sum, c) => sum + (c.valor_total || 0), 0) || 0
      const totalRevenue = allContractsResult.data?.reduce((sum, c) => sum + (c.valor_total || 0), 0) || 0
      const paidContracts = paidPaymentsResult.data?.length || 0
      const paidRevenue = paidPaymentsResult.data?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0

      setStats({
        totalContracts: contractsCountResult.count || 0,
        activeRevenue,
        totalRevenue,
        totalClients: clientsCountResult.count || 0,
        paidContracts,
        paidRevenue,
      })

      console.log("[v0] Stats fetched successfully:", {
        totalContracts: contractsCountResult.count,
        paidContracts,
        paidRevenue,
      })
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <MainLayout showBackButton={true} title="Relatórios">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total de Contratos"
            value={isLoading ? "..." : stats.totalContracts}
            description="Contratos cadastrados"
            icon={FileText}
            href="/contratos"
          />
          <StatsCard
            title="Receita Ativa"
            value={isLoading ? "..." : formatCurrency(stats.activeRevenue)}
            description="Contratos em andamento"
            icon={DollarSign}
            href="/contratos"
          />
          <StatsCard
            title="Receita Total"
            value={isLoading ? "..." : formatCurrency(stats.totalRevenue)}
            description="Todos os contratos"
            icon={TrendingUp}
            href="/contratos"
          />
          <StatsCard
            title="Contratos Pagos"
            value={isLoading ? "..." : stats.paidContracts}
            description={isLoading ? "..." : formatCurrency(stats.paidRevenue)}
            icon={CheckCircle2}
            href="/pagamentos"
          />
          <StatsCard
            title="Total de Clientes"
            value={isLoading ? "..." : stats.totalClients}
            description="Clientes cadastrados"
            icon={Users}
            href="/clientes"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart />
          <EquipmentUtilization />
        </div>
      </div>
    </MainLayout>
  )
}
