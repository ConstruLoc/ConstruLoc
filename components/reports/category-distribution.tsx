"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"]

export function CategoryDistribution() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCategoryData()
  }, [])

  const fetchCategoryData = async () => {
    try {
      const { data: equipments, error } = await supabase
        .from("equipamentos")
        .select("categoria_id, quantidade, categorias_equipamentos(nome)")

      if (error) throw error

      const categoryMap: { [key: string]: number } = {}

      equipments?.forEach((equipment: any) => {
        const categoryName = equipment.categorias_equipamentos?.nome || "Sem categoria"
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (equipment.quantidade || 0)
      })

      const chartData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }))

      setData(chartData)
    } catch (error) {
      console.error("Error fetching category data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">Distribuição por Categoria</CardTitle>
        <CardDescription className="text-gray-400">Quantidade de equipamentos por categoria</CardDescription>
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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                formatter={(value: number) => [`${value} unidades`, "Quantidade"]}
              />
              <Legend
                wrapperStyle={{ color: "#9CA3AF" }}
                formatter={(value) => <span className="text-gray-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
