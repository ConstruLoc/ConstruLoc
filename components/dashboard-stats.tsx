"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Users, FileText, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  equipamentosDisponiveis: number
  clientesAtivos: number
  contratosAtivos: number
  receitaMensal: number
}

export function DashboardStats() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    equipamentosDisponiveis: 0,
    clientesAtivos: 0,
    contratosAtivos: 0,
    receitaMensal: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Count available equipment
      const { count: equipmentCount } = await supabase
        .from("equipamentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel")

      // Count active clients
      const { count: clientCount } = await supabase.from("clientes").select("*", { count: "exact", head: true })

      // Count active contracts
      const { count: contractCount } = await supabase
        .from("contratos")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativo")

      // Calculate monthly revenue from active contracts
      const { data: contracts } = await supabase.from("contratos").select("valor_total").eq("status", "ativo")

      const totalRevenue = contracts?.reduce((sum, contract) => sum + (Number(contract.valor_total) || 0), 0) || 0

      setStats({
        equipamentosDisponiveis: equipmentCount || 0,
        clientesAtivos: clientCount || 0,
        contratosAtivos: contractCount || 0,
        receitaMensal: totalRevenue,
      })
    } catch (error) {
      console.error("[v0] Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statsConfig = [
    {
      title: "Equipamentos Disponíveis",
      value: stats.equipamentosDisponiveis.toString(),
      icon: Package,
      description: "Prontos para locação",
      trend: "+12%",
      trendUp: true,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
      href: "/equipamentos",
    },
    {
      title: "Clientes Ativos",
      value: stats.clientesAtivos.toString(),
      icon: Users,
      description: "Cadastrados no sistema",
      trend: "+8%",
      trendUp: true,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
      href: "/clientes",
    },
    {
      title: "Contratos Ativos",
      value: stats.contratosAtivos.toString(),
      icon: FileText,
      description: "Em andamento",
      trend: "+5%",
      trendUp: true,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
      href: "/contratos",
    },
    {
      title: "Receita Mensal",
      value: `R$ ${stats.receitaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Mês atual",
      trend: "+15%",
      trendUp: true,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
      href: "/pagamentos",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-600 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-600 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card
            key={stat.title}
            onClick={() => router.push(stat.href)}
            className={`border-l-4 ${stat.borderColor} hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-400 transition-all duration-200 bg-gray-800 border-gray-700 cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400 mb-2">{stat.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{stat.description}</p>
                <Badge variant="secondary" className="flex items-center gap-1 bg-gray-700 text-gray-300">
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={stat.trendUp ? "text-green-400" : "text-red-400"}>{stat.trend}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
