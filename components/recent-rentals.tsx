"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Calendar, User, Package, Clock } from "lucide-react"
import Link from "next/link"
import { maskClientName } from "@/lib/utils/demo-mode"

interface RecentRental {
  id: string
  numero_contrato: string
  data_inicio: string
  data_fim: string // Added data_fim to interface
  status: string
  clientes: {
    // Changed from cliente to clientes to match Supabase response
    nome: string
  } | null
  itens_contrato: Array<{
    equipamento_id: string
    equipamentos: {
      nome: string
    }
  }>
}

export function RecentRentals() {
  const [rentals, setRentals] = useState<RecentRental[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRecentRentals()
  }, [])

  const fetchRecentRentals = async () => {
    try {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          id,
          numero_contrato,
          data_inicio,
          data_fim,
          status,
          clientes (
            nome
          ),
          itens_contrato (
            equipamento_id,
            equipamentos (
              nome
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error

      setRentals(data || [])
    } catch (error) {
      console.error("[v0] Error fetching recent rentals:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "concluido":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "cancelado":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "pendente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo"
      case "concluido":
        return "Concluído"
      case "cancelado":
        return "Cancelado"
      case "pendente":
        return "Pendente"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5 text-orange-500" />
            Locações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <span className="text-slate-400">Carregando locações...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="h-5 w-5 text-orange-500" />
          Locações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rentals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">Nenhuma locação recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rentals.map((rental, index) => {
              const daysRemaining = rental.data_fim ? getDaysRemaining(rental.data_fim) : null
              const clientName = maskClientName(rental.clientes?.nome || "Cliente não encontrado", index)

              return (
                <Link
                  key={rental.id}
                  href={`/contratos/${rental.id}`}
                  className="block p-4 rounded-lg border border-slate-700 hover:border-orange-500 hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white text-sm">{rental.numero_contrato}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-400">{clientName}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(rental.status)} border text-xs`}>
                      {getStatusLabel(rental.status)}
                    </Badge>
                  </div>

                  {rental.itens_contrato && rental.itens_contrato.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-3 w-3 text-slate-400" />
                      <p className="text-xs text-slate-400">{rental.itens_contrato.length} equipamento(s)</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <p className="text-xs text-slate-400">
                      Início: {new Date(rental.data_inicio).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {daysRemaining !== null && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-orange-500" />
                      <p className="text-xs text-orange-500 font-medium">
                        {daysRemaining > 0
                          ? `${daysRemaining} dia(s) restante(s)`
                          : daysRemaining === 0
                            ? "Termina hoje"
                            : `Atrasado há ${Math.abs(daysRemaining)} dia(s)`}
                      </p>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
