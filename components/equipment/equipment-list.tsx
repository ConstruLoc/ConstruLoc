"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  Wrench,
  Filter,
  Package,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Equipment {
  id: string
  nome: string
  marca: string
  modelo: string
  valor_diario: number
  status: string
  localizacao: string
  categoria_id: string
  imagem_url: string | null
  descricao: string | null
  ano_fabricacao: number | null
  quantidade: number
  categorias_equipamentos: {
    nome: string
  }
  stock_count?: number
}

export function EquipmentList() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEquipments()
    fetchCategories()
  }, [])

  useEffect(() => {
    filterEquipments()
  }, [equipments, searchTerm, statusFilter, categoryFilter])

  const fetchEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from("equipamentos")
        .select(`
          *,
          categorias_equipamentos (
            nome
          )
        `)
        .order("nome")

      if (error) throw error

      console.log("[v0] Fetched equipments from database:", data)

      const equipmentsWithStock = (data || []).map((equipment) => ({
        ...equipment,
        stock_count: equipment.quantidade || 0,
      }))

      console.log("[v0] Equipments with stock count:", equipmentsWithStock)

      setEquipments(equipmentsWithStock)
    } catch (error) {
      console.error("[v0] Error fetching equipments:", error)
      setEquipments([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categorias_equipamentos").select("*").order("nome")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const filterEquipments = () => {
    let filtered = equipments

    if (searchTerm) {
      filtered = filtered.filter(
        (equipment) =>
          equipment.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equipment.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equipment.modelo?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((equipment) => equipment.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((equipment) => equipment.categoria_id === categoryFilter)
    }

    setFilteredEquipments(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponivel":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "locado":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "manutencao":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "inativo":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "disponivel":
        return "🟢"
      case "locado":
        return "🔵"
      case "manutencao":
        return "🟡"
      case "inativo":
        return "⚫"
      default:
        return "⚫"
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este equipamento?")) {
      try {
        const { error } = await supabase.from("equipamentos").delete().eq("id", id)
        if (error) throw error
        fetchEquipments()
      } catch (error) {
        console.error("Error deleting equipment:", error)
        alert("Erro ao excluir equipamento. Verifique se não há contratos associados.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-600 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-600 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-3 md:p-6 animate-pulse">
              <div className="h-32 md:h-48 bg-gray-600 rounded-lg mb-2 md:mb-4"></div>
              <div className="h-4 md:h-6 bg-gray-600 rounded mb-1 md:mb-2"></div>
              <div className="h-3 md:h-4 bg-gray-600 rounded mb-2 md:mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 md:h-6 w-16 md:w-20 bg-gray-600 rounded"></div>
                <div className="h-6 md:h-8 w-6 md:w-8 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Equipamentos</h1>
          <p className="text-sm md:text-base text-gray-300 mt-1">Gerencie todos os equipamentos do sistema</p>
        </div>
        <Button asChild className="bg-orange-600 hover:bg-orange-700 shadow-lg text-sm md:text-base">
          <Link href="/equipamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Equipamento
          </Link>
        </Button>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-sm p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por nome, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-gray-600 focus:border-orange-500 focus:ring-orange-500 text-base rounded-xl bg-gray-700 focus:bg-gray-600 transition-colors text-white placeholder:text-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Status</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">
                    Todos os status
                  </SelectItem>
                  <SelectItem value="disponivel" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">🟢</span>
                      Disponível
                    </div>
                  </SelectItem>
                  <SelectItem value="locado" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">🔵</span>
                      Locado
                    </div>
                  </SelectItem>
                  <SelectItem value="manutencao" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">🟡</span>
                      Manutenção
                    </div>
                  </SelectItem>
                  <SelectItem value="inativo" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">⚫</span>
                      Inativo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Categoria</span>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-white">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">
                    Todas as categorias
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-700">
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {filteredEquipments.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gray-800 border-gray-700">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="text-4xl md:text-6xl mb-4">🔍</div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Nenhum equipamento encontrado</h3>
            <p className="text-sm md:text-base text-gray-300">
              Tente ajustar os filtros ou adicionar um novo equipamento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredEquipments.map((equipment) => (
            <Card
              key={equipment.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-gray-800 border-gray-700 relative"
            >
              <div className="absolute top-2 left-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-gray-700/90 hover:bg-gray-600 border border-gray-600 shadow-md backdrop-blur-sm"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-gray-800 border-gray-700">
                    <DropdownMenuItem asChild className="text-white hover:bg-gray-700">
                      <Link href={`/equipamentos/detalhes/${equipment.id}`} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-white hover:bg-gray-700">
                      <Link href={`/equipamentos/detalhes/${equipment.id}/editar`} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(equipment.id)}
                      className="text-red-400 cursor-pointer hover:bg-gray-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="relative h-32 md:h-48 bg-gradient-to-br from-gray-700 to-gray-600 overflow-hidden">
                {equipment.imagem_url ? (
                  <Image
                    src={equipment.imagem_url || "/placeholder.svg"}
                    alt={equipment.nome}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-3xl md:text-6xl">🏗️</div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Badge
                    className={`${getStatusColor(equipment.status)} font-medium border text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5`}
                  >
                    <span className="mr-1">{getStatusIcon(equipment.status)}</span>
                    <span className="hidden sm:inline">{getStatusLabel(equipment.status)}</span>
                    <span className="sm:hidden">{getStatusLabel(equipment.status).slice(0, 4)}</span>
                  </Badge>
                  <Badge className="bg-orange-600/90 text-white border-orange-500/50 font-bold text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 backdrop-blur-sm">
                    <Package className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    {equipment.stock_count || 0} em estoque
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3 md:p-6">
                <div className="mb-2 md:mb-4">
                  <h3 className="text-sm md:text-xl font-bold text-white mb-1 line-clamp-2 leading-tight">
                    {equipment.nome}
                  </h3>
                  <p className="text-xs md:text-sm text-orange-400 font-medium line-clamp-1">
                    {equipment.categorias_equipamentos?.nome || "Sem categoria"}
                  </p>
                </div>

                <div className="space-y-1 md:space-y-2 mb-2 md:mb-4">
                  {(equipment.marca || equipment.modelo) && (
                    <div className="flex items-center text-xs md:text-sm text-gray-300">
                      <Wrench className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-gray-400 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {equipment.marca && equipment.modelo
                          ? `${equipment.marca} ${equipment.modelo}`
                          : equipment.marca || equipment.modelo}
                      </span>
                    </div>
                  )}

                  {equipment.localizacao && (
                    <div className="hidden md:flex items-center text-sm text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{equipment.localizacao}</span>
                    </div>
                  )}

                  {equipment.ano_fabricacao && (
                    <div className="hidden md:flex items-center text-sm text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{equipment.ano_fabricacao}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 md:pt-4 border-t border-gray-600">
                  <div>
                    <p className="text-lg md:text-2xl font-bold text-white">
                      R$ {equipment.valor_diario?.toFixed(2) || "0,00"}
                    </p>
                    <p className="text-xs text-gray-400">por dia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
