"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Users, FileText, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Stats {
  equipamentosDisponiveis: number
  clientesAtivos: number
  contratosAtivos: number
  receitaMensal: number
}

type PeriodFilter = "today" | "currentMonth" | "custom"

export function DashboardStats() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    equipamentosDisponiveis: 0,
    clientesAtivos: 0,
    contratosAtivos: 0,
    receitaMensal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("today")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [periodFilter, selectedMonth])

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

      let query = supabase
        .from("pagamentos_mensais")
        .select("valor")
        .eq("status", "pago")

      const now = new Date()
      let startDate: Date | null = null
      let endDate: Date | null = null

      if (periodFilter === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      } else if (periodFilter === "currentMonth") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      } else if (periodFilter === "custom" && selectedMonth) {
        const [year, month] = selectedMonth.split('-').map(Number)
        startDate = new Date(year, month - 1, 1)
        endDate = new Date(year, month, 0, 23, 59, 59)
      }

      if (startDate) {
        query = query.gte("data_pagamento", startDate.toISOString())
      }
      if (endDate) {
        query = query.lte("data_pagamento", endDate.toISOString())
      }

      const { data: payments } = await query

      const totalRevenue = payments?.reduce((sum, payment) => sum + (Number(payment.valor) || 0), 0) || 0

      setStats({
        equipamentosDisponiveis: equipmentCount || 0,
        clientesAtivos: clientCount || 0,
        contratosAtivos: contractCount || 0,
        receitaMensal: totalRevenue,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPeriodDescription = () => {
    if (periodFilter === "today") {
      return "Hoje"
    } else if (periodFilter === "currentMonth") {
      return "Mês atual"
    } else if (periodFilter === "custom" && selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number)
      const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ]
      return `${monthNames[month - 1]}/${year}`
    }
    return "Período"
  }

  const generateMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const value = `${year}-${String(month).padStart(2, '0')}`
      const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ]
      const label = `${monthNames[month - 1]} ${year}`
      options.push({ value, label })
    }
    return options
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
      description: getPeriodDescription(),
      trend: "+15%",
      trendUp: true,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
      href: "/pagamentos",
      hasFilter: true,
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
            onClick={() => !stat.hasFilter && router.push(stat.href)}
            className={`border-l-4 ${stat.borderColor} hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-400 transition-all duration-200 bg-gray-800 border-gray-700 ${!stat.hasFilter ? 'cursor-pointer' : ''}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400 mb-2">{stat.value}</div>
              
              {stat.hasFilter ? (
                <div className="space-y-2">
                  <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodFilter)}>
                    <SelectTrigger className="w-full h-8 text-xs bg-gray-700 border-gray-600 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="today" className="text-gray-300 focus:bg-gray-700 focus:text-white">
                        Hoje
                      </SelectItem>
                      <SelectItem value="currentMonth" className="text-gray-300 focus:bg-gray-700 focus:text-white">
                        Mês atual
                      </SelectItem>
                      <SelectItem value="custom" className="text-gray-300 focus:bg-gray-700 focus:text-white">
                        Escolher mês
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {periodFilter === "custom" && (
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-full h-8 text-xs bg-gray-700 border-gray-600 text-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                        {generateMonthOptions().map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-gray-300 focus:bg-gray-700 focus:text-white"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Badge variant="secondary" className="flex items-center gap-1 bg-gray-700 text-gray-300 w-full justify-center">
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className={stat.trendUp ? "text-green-400" : "text-red-400"}>{stat.trend}</span>
                  </Badge>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
