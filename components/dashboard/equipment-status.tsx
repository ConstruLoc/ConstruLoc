"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Mock data - in real app this would come from database
const equipmentStats = {
  total: 45,
  disponivel: 28,
  locado: 12,
  manutencao: 3,
  inativo: 2,
}

export function EquipmentStatus() {
  const getPercentage = (value: number) => (value / equipmentStats.total) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Equipamentos</CardTitle>
        <CardDescription>Visão geral da disponibilidade dos equipamentos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Disponível</span>
            </div>
            <span className="text-sm text-gray-600">{equipmentStats.disponivel}</span>
          </div>
          <Progress value={getPercentage(equipmentStats.disponivel)} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Locado</span>
            </div>
            <span className="text-sm text-gray-600">{equipmentStats.locado}</span>
          </div>
          <Progress value={getPercentage(equipmentStats.locado)} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">Manutenção</span>
            </div>
            <span className="text-sm text-gray-600">{equipmentStats.manutencao}</span>
          </div>
          <Progress value={getPercentage(equipmentStats.manutencao)} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-medium">Inativo</span>
            </div>
            <span className="text-sm text-gray-600">{equipmentStats.inativo}</span>
          </div>
          <Progress value={getPercentage(equipmentStats.inativo)} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
