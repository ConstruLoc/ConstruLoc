import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EquipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (id === "novo") {
      notFound()
    }

    const supabase = await createClient()

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.log("[v0] Invalid UUID format:", id)
      notFound()
    }

    const { data: equipment, error } = await supabase
      .from("equipamentos")
      .select(`
        *,
        categorias_equipamentos (
          nome
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao buscar equipamento:", error)
      notFound()
    }

    if (!equipment) {
      notFound()
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "disponivel":
          return "bg-green-100 text-green-800"
        case "locado":
          return "bg-blue-100 text-blue-800"
        case "manutencao":
          return "bg-yellow-100 text-yellow-800"
        case "inativo":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    const getStatusLabel = (status: string) => {
      switch (status) {
        case "disponivel":
          return "Disponível"
        case "locado":
          return "Locado"
        case "manutencao":
          return "Manutenção"
        case "inativo":
          return "Inativo"
        default:
          return status
      }
    }

    return (
      <div className="space-y-6">
        <Header title="Detalhes do Equipamento" />

        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/equipamentos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href={`/equipamentos/detalhes/${equipment.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{equipment.nome}</CardTitle>
                  <CardDescription className="text-gray-400">{equipment.categorias_equipamentos?.nome}</CardDescription>
                </div>
                <Badge className={getStatusColor(equipment.status)}>{getStatusLabel(equipment.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-400">Marca</p>
                  <p className="text-sm text-white">{equipment.marca || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Modelo</p>
                  <p className="text-sm text-white">{equipment.modelo || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Ano de Fabricação</p>
                  <p className="text-sm text-white">{equipment.ano_fabricacao || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Número de Série</p>
                  <p className="text-sm text-white">{equipment.numero_serie || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Localização</p>
                  <p className="text-sm text-white">{equipment.localizacao || "-"}</p>
                </div>
              </div>

              {equipment.descricao && (
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Descrição</p>
                  <p className="text-sm text-gray-300">{equipment.descricao}</p>
                </div>
              )}

              {equipment.observacoes && (
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Observações</p>
                  <p className="text-sm text-gray-300">{equipment.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Valores de Locação</CardTitle>
              <CardDescription className="text-gray-400">Preços para diferentes períodos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Valor Diário</p>
                    <p className="text-sm text-gray-400">Por dia</p>
                  </div>
                  <p className="text-lg font-bold text-orange-500">
                    R$ {equipment.valor_diario?.toFixed(2).replace(".", ",") || "0,00"}
                  </p>
                </div>

                {equipment.valor_semanal && (
                  <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Valor Semanal</p>
                      <p className="text-sm text-gray-400">Por semana</p>
                    </div>
                    <p className="text-lg font-bold text-orange-500">
                      R$ {equipment.valor_semanal.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                )}

                {equipment.valor_mensal && (
                  <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Valor Mensal</p>
                      <p className="text-sm text-gray-400">Por mês</p>
                    </div>
                    <p className="text-lg font-bold text-orange-500">
                      R$ {equipment.valor_mensal.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Erro na página de detalhes do equipamento:", error)
    notFound()
  }
}
