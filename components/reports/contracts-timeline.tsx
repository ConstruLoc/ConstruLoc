"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function ContractsTimeline() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchContractsData()
  }, [])

  const fetchContractsData = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(endDate.getMonth() - 6)

      const { data: contracts, error } = await supabase
        .from("contratos")
        .select("data_inicio, status")
        .gte("data_inicio", startDate.toISOString().split("T")[0])

      if (error) throw error

      const monthlyData: { [key: string]: { ativos: number; concluidos: number; cancelados: number } } = {}

      contracts?.forEach((contract) => {
        const date = new Date(contract.data_inicio)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ativos: 0, concluidos: 0, cancelados: 0 }
        }

        if (contract.status === "ativo") monthlyData[monthKey].ativos++
        else if (contract.status === "concluido") monthlyData[monthKey].concluidos++
        else if (contract.status === "cancelado") monthlyData[monthKey].cancelados++
      })

      const chartData = Object.entries(monthlyData)
        .map(([month, counts]) => ({
          month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
          Ativos: counts.ativos,
          Concluídos: counts.concluidos,
          Cancelados: counts.cancelados,
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

      setData(chartData)
    } catch (error) {
      console.error("Error fetching contracts data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">Linha do Tempo de Contratos</CardTitle>
        <CardDescription className="text-gray-400">Status dos contratos nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Carregando dados...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-400">Nenhum dado disponível</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#F3F4F6" }}
              />
              <Legend
                wrapperStyle={{ color: "#9CA3AF" }}
                formatter={(value) => <span className="text-gray-300">{value}</span>}
              />
              <Line type="monotone" dataKey="Ativos" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Concluídos" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Cancelados" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
