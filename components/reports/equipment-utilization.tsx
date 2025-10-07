"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface EquipmentStats {
  id: string
  nome: string
  total_contracts: number
  days_rented: number
  utilization_rate: number
}

export function EquipmentUtilization() {
  const [equipmentStats, setEquipmentStats] = useState<EquipmentStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEquipmentStats()
  }, [])

  const fetchEquipmentStats = async () => {
    try {
      const { data: equipments, error } = await supabase.from("equipamentos").select(`
          id,
          nome,
          itens_contrato (
            contratos (
              data_inicio,
              data_fim
            )
          )
        `)

      if (error) throw error

      const stats: EquipmentStats[] =
        equipments?.map((equipment) => {
          const contracts = equipment.itens_contrato || []

          const totalContracts = contracts.length
          const daysRented = contracts.reduce((total: number, item: any) => {
            const start = new Date(item.contratos.data_inicio)
            const end = new Date(item.contratos.data_fim)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
            return total + days
          }, 0)

          // Calculate utilization rate (simplified - based on last 365 days)
          const utilizationRate = Math.min((daysRented / 365) * 100, 100)

          return {
            id: equipment.id,
            nome: equipment.nome,
            total_contracts: totalContracts,
            days_rented: daysRented,
            utilization_rate: utilizationRate,
          }
        }) || []

      // Sort by utilization rate
      stats.sort((a, b) => b.utilization_rate - a.utilization_rate)

      setEquipmentStats(stats.slice(0, 10)) // Top 10
    } catch (error) {
      console.error("Error fetching equipment stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Utilização de Equipamentos</CardTitle>
          <CardDescription className="text-gray-400">Taxa de utilização dos equipamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Utilização de Equipamentos</CardTitle>
        <CardDescription className="text-gray-400">Top 10 equipamentos mais utilizados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {equipmentStats.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhum dado disponível</p>
        ) : (
          equipmentStats.map((equipment) => (
            <div key={equipment.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-white">{equipment.nome}</p>
                  <p className="text-xs text-gray-400">
                    {equipment.total_contracts} contratos • {equipment.days_rented} dias locados
                  </p>
                </div>
                <span className="text-sm font-medium text-orange-500">{equipment.utilization_rate.toFixed(1)}%</span>
              </div>
              <Progress value={equipment.utilization_rate} className="h-2 bg-gray-700" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
