"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RevenueChart } from "@/components/reports/revenue-chart"
import { EquipmentUtilization } from "@/components/reports/equipment-utilization"
import { CategoryDistribution } from "@/components/reports/category-distribution"
import { ContractsTimeline } from "@/components/reports/contracts-timeline"
import { ReceivablesReport } from "@/components/reports/receivables-report"
import { FileText, DollarSign, TrendingUp, Users, CheckCircle2, Download, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      console.log("[v0] Starting fetchStats in parallel...")

      const [contractsCountResult, activeContractsResult, allContractsResult, clientsCountResult, paidPaymentsResult] =
        await Promise.all([
          supabase.from("contratos").select("id", { count: "exact", head: true }),
          supabase.from("contratos").select("valor_total").eq("status", "ativo"),
          supabase.from("contratos").select("valor_total"),
          supabase.from("clientes").select("id", { count: "exact", head: true }),
          supabase.from("pagamentos").select("valor").eq("status", "pago"),
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

      console.log("[v0] Stats fetched successfully")
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

  const generatePDF = () => {
    setIsGeneratingPDF(true)

    toast({
      title: "Preparando impressão...",
      description: "Abrindo diálogo de impressão. Selecione 'Salvar como PDF' para exportar.",
      className: "bg-blue-600 text-white border-blue-700",
    })

    setTimeout(() => {
      window.print()
      setIsGeneratingPDF(false)
    }, 500)
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          nav,
          aside,
          .no-print,
          button {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .recharts-wrapper {
            page-break-inside: avoid;
          }

          .print\\:bg-white {
            background: white !important;
            border: 1px solid #e5e7eb !important;
          }

          .print\\:text-gray-900 {
            color: #111827 !important;
          }

          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }

          @page {
            margin: 2cm;
          }

          .stats-card,
          .chart-container {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <MainLayout showBackButton={true} title="Relatórios">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center no-print mb-4">
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="receivables" className="data-[state=active]:bg-orange-500">
                  <Calendar className="mr-2 h-4 w-4" />
                  Recebimentos
                </TabsTrigger>
              </TabsList>

              {activeTab === "overview" && (
                <Button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isGeneratingPDF ? "Preparando..." : "Exportar Relatório (PDF)"}
                </Button>
              )}
            </div>

            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="hidden print:block mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Relatório ConstruLoc</h1>
                <p className="text-gray-600 mt-2">
                  Gerado em:{" "}
                  {new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

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

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="chart-container">
                  <RevenueChart />
                </div>
                <div className="chart-container">
                  <EquipmentUtilization />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="chart-container">
                  <CategoryDistribution />
                </div>
                <div className="chart-container">
                  <ContractsTimeline />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="receivables" className="mt-0">
              <ReceivablesReport />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  )
}
