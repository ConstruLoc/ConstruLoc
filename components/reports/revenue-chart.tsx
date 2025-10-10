"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function RevenueChart() {
  const [data, setData] = useState<any[]>([])
  const [period, setPeriod] = useState("6months")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRevenueData()
  }, [period])

  const fetchRevenueData = async () => {
    setIsLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()

      switch (period) {
        case "3months":
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case "6months":
          startDate.setMonth(endDate.getMonth() - 6)
          break
        case "1year":
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const { data: contracts, error } = await supabase
        .from("contratos")
        .select("data_inicio, valor_total")
        .gte("data_inicio", startDate.toISOString().split("T")[0])
        .lte("data_inicio", endDate.toISOString().split("T")[0])

      if (error) throw error

      const monthlyData: { [key: string]: number } = {}

      contracts?.forEach((contract) => {
        const date = new Date(contract.data_inicio)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (contract.valor_total || 0)
      })

      const chartData = Object.entries(monthlyData)
        .map(([month, revenue]) => ({
          month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
          receita: revenue,
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

      setData(chartData)
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-xl font-bold">Receita por Período</CardTitle>
            <CardDescription className="text-gray-400">Evolução da receita ao longo do tempo</CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Carregando dados...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-400">Nenhum dado disponível para o período selecionado</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#F3F4F6" }}
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                  "Receita",
                ]}
              />
              <Area type="monotone" dataKey="receita" stroke="#ea580c" fillOpacity={1} fill="url(#colorReceita)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
