"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

// Mock data - in real app this would come from database
const recentContracts = [
  {
    id: "1",
    numero: "CL240001",
    cliente: "Construtora ABC Ltda",
    valor: "R$ 15.750,00",
    status: "ativo",
    dataInicio: "2024-01-15",
    dataFim: "2024-02-15",
  },
  {
    id: "2",
    numero: "CL240002",
    cliente: "Obras & Construções XYZ",
    valor: "R$ 8.900,00",
    status: "pendente",
    dataInicio: "2024-01-20",
    dataFim: "2024-01-27",
  },
  {
    id: "3",
    numero: "CL240003",
    cliente: "Empreiteira Silva & Cia",
    valor: "R$ 22.400,00",
    status: "ativo",
    dataInicio: "2024-01-18",
    dataFim: "2024-03-18",
  },
  {
    id: "4",
    numero: "CL240004",
    cliente: "Construtora Moderna",
    valor: "R$ 5.200,00",
    status: "finalizado",
    dataInicio: "2024-01-10",
    dataFim: "2024-01-17",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "ativo":
      return "bg-green-100 text-green-800"
    case "pendente":
      return "bg-yellow-100 text-yellow-800"
    case "finalizado":
      return "bg-gray-100 text-gray-800"
    case "cancelado":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "ativo":
      return "Ativo"
    case "pendente":
      return "Pendente"
    case "finalizado":
      return "Finalizado"
    case "cancelado":
      return "Cancelado"
    default:
      return status
  }
}

export function RecentContracts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos Recentes</CardTitle>
        <CardDescription>Últimos contratos criados no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentContracts.map((contract) => (
            <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-gray-900">{contract.numero}</h4>
                  <Badge className={getStatusColor(contract.status)}>{getStatusLabel(contract.status)}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{contract.cliente}</p>
                <p className="text-sm text-gray-500">
                  {new Date(contract.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                  {new Date(contract.dataFim).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 mb-2">{contract.valor}</p>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
