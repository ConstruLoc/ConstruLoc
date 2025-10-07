"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Loader2, Search, Package, X, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Equipment {
  id: string
  nome: string
  marca: string
  modelo: string
  valor_diario: number
  valor_semanal: number
  valor_mensal: number
  imagem_url?: string
  categoria_id: string
  status: string
  localizacao: string
  stock_count?: number
  quantidade?: number
}

interface ContractItem {
  equipamento_id: string
  equipamento: Equipment | null
  quantidade: number
  valor_unitario: number
  valor_total: number
}

interface Client {
  id: string
  nome: string
  empresa?: string
  email: string
  telefone: string
}

interface ContractCreationFormProps {
  contract?: any
  onSuccess?: () => void
}

export function ContractCreationForm({ contract, onSuccess }: ContractCreationFormProps) {
  const [formData, setFormData] = useState({
    cliente_id: contract?.cliente_id || "",
    data_inicio: contract?.data_inicio || "",
    data_fim: contract?.data_fim || "",
    status: contract?.status || "pendente",
    status_pagamento: "pendente",
    observacoes: contract?.observacoes || "",
  })

  const [items, setItems] = useState<ContractItem[]>(contract?.itens_contrato || [])
  const [clients, setClients] = useState<Client[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
    fetchEquipments()
  }, [])

  useEffect(() => {
    filterEquipments()
  }, [equipments, searchTerm])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from("clientes").select("id, nome, empresa, email, telefone").order("nome")
      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from("equipamentos")
        .select(`
          id, nome, marca, modelo, valor_diario, valor_semanal, valor_mensal,
          imagem_url, categoria_id, status, localizacao, quantidade,
          categorias_equipamentos(nome)
        `)
        .eq("status", "disponivel")
        .order("nome")

      if (error) throw error

      const equipmentsWithStock = (data || []).map((equipment) => ({
        ...equipment,
        stock_count: equipment.quantidade || 0,
      }))

      setEquipments(equipmentsWithStock)
    } catch (error) {
      console.error("Error fetching equipments:", error)
    }
  }

  const filterEquipments = () => {
    let filtered = equipments

    if (searchTerm) {
      filtered = filtered.filter(
        (eq) =>
          eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.modelo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredEquipments(filtered)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addEquipmentToContract = (equipment: Equipment) => {
    const existingItem = items.find((item) => item.equipamento_id === equipment.id)

    if (existingItem) {
      updateItemQuantity(equipment.id, existingItem.quantidade + 1)
    } else {
      const newItem: ContractItem = {
        equipamento_id: equipment.id,
        equipamento: equipment,
        quantidade: 1,
        valor_unitario: equipment.valor_diario,
        valor_total: equipment.valor_diario,
      }
      setItems((prev) => [...prev, newItem])
    }
  }

  const updateItemQuantity = (equipmentId: string, newQuantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.equipamento_id === equipmentId) {
          const quantity = Math.max(1, Math.min(newQuantity, item.equipamento?.stock_count || 1))
          return {
            ...item,
            quantidade: quantity,
            valor_total: item.valor_unitario * quantity,
          }
        }
        return item
      }),
    )
  }

  const removeItem = (equipmentId: string) => {
    setItems((prev) => prev.filter((item) => item.equipamento_id !== equipmentId))
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.valor_total, 0)
  }

  const calculateDays = () => {
    if (!formData.data_inicio || !formData.data_fim) return 0

    const [startYear, startMonth, startDay] = formData.data_inicio.split("-").map(Number)
    const [endYear, endMonth, endDay] = formData.data_fim.split("-").map(Number)

    // Create dates at noon local time to avoid timezone edge cases
    const start = new Date(startYear, startMonth - 1, startDay, 12, 0, 0)
    const end = new Date(endYear, endMonth - 1, endDay, 12, 0, 0)

    const diffTime = end.getTime() - start.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    return days
  }

  const getAvailabilityStatus = (quantity?: number) => {
    if (!quantity || quantity === 0) {
      return { status: "Indisponível", color: "bg-red-500", icon: XCircle }
    }
    if (quantity <= 2) {
      return { status: "Estoque Baixo", color: "bg-yellow-500", icon: AlertCircle }
    }
    return { status: "Disponível", color: "bg-green-500", icon: CheckCircle2 }
  }

  const validateForm = () => {
    if (!formData.cliente_id) {
      setError("Cliente é obrigatório")
      return false
    }
    if (!formData.data_inicio || !formData.data_fim) {
      setError("Datas de início e fim são obrigatórias")
      return false
    }
    if (new Date(formData.data_fim) <= new Date(formData.data_inicio)) {
      setError("Data de fim deve ser posterior à data de início")
      return false
    }
    if (items.length === 0) {
      setError("Adicione pelo menos um equipamento ao contrato")
      return false
    }
    const invalidItems = items.filter((item) => !item.quantidade || item.quantidade < 1)
    if (invalidItems.length > 0) {
      setError("Todos os equipamentos devem ter quantidade maior ou igual a 1")
      return false
    }
    return true
  }

  const generateContractNumber = async (): Promise<string> => {
    try {
      // Busca contratos ativos
      const { data: activeContracts, error: activeError } = await supabase
        .from("contratos")
        .select("numero_contrato")
        .order("numero_contrato", { ascending: false })
        .limit(1)

      if (activeError) throw activeError

      // Busca contratos excluídos (na tabela de pagamentos)
      const { data: deletedContracts, error: deletedError } = await supabase
        .from("pagamentos")
        .select("contrato_numero")
        .not("contrato_numero", "is", null)
        .order("contrato_numero", { ascending: false })
        .limit(1)

      if (deletedError) throw deletedError

      // Extrai os números de ambas as fontes
      const numbers: number[] = []

      if (activeContracts && activeContracts.length > 0) {
        const match = activeContracts[0].numero_contrato.match(/\d+/)
        if (match) numbers.push(Number.parseInt(match[0]))
      }

      if (deletedContracts && deletedContracts.length > 0) {
        const match = deletedContracts[0].contrato_numero.match(/\d+/)
        if (match) numbers.push(Number.parseInt(match[0]))
      }

      // Pega o maior número e incrementa
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
      const nextNumber = maxNumber + 1
      const contractNumber = `CL-${String(nextNumber).padStart(4, "0")}`

      console.log("[v0] Generated contract number:", contractNumber)
      return contractNumber
    } catch (error) {
      console.error("Error generating contract number:", error)
      // Fallback para número baseado em timestamp
      return `CL-${Date.now().toString().slice(-4)}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const contractData = {
        cliente_id: formData.cliente_id,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        status: formData.status,
        observacoes: formData.observacoes,
        valor_total: calculateTotal(),
      }

      let contractId: string

      if (contract?.id) {
        const { data: oldItems } = await supabase
          .from("itens_contrato")
          .select("equipamento_id, quantidade")
          .eq("contrato_id", contract.id)

        if (oldItems) {
          for (const oldItem of oldItems) {
            await supabase.rpc("increment_equipment_stock", {
              equipment_id: oldItem.equipamento_id,
              quantity: oldItem.quantidade,
            })
          }
        }

        const { error } = await supabase.from("contratos").update(contractData).eq("id", contract.id)
        if (error) throw error
        contractId = contract.id

        await supabase.from("itens_contrato").delete().eq("contrato_id", contractId)
      } else {
        const contractNumber = await generateContractNumber()

        const { data, error } = await supabase
          .from("contratos")
          .insert([{ ...contractData, numero_contrato: contractNumber }])
          .select()
          .single()

        if (error) {
          console.error("Error inserting contract:", error)
          throw error
        }

        contractId = data.id

        const paymentData = {
          contrato_id: contractId,
          valor: calculateTotal(),
          data_vencimento: formData.data_fim,
          status: formData.status_pagamento,
          forma_pagamento: "A definir",
        }

        const { error: paymentError } = await supabase.from("pagamentos").insert([paymentData])

        if (paymentError) {
          console.error("Error creating payment:", paymentError)
        }
      }

      const itemsData = items.map((item) => ({
        contrato_id: contractId,
        equipamento_id: item.equipamento_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
      }))

      const { error: itemsError } = await supabase.from("itens_contrato").insert(itemsData)
      if (itemsError) throw itemsError

      for (const item of items) {
        const { error: stockError } = await supabase.rpc("decrement_equipment_stock", {
          equipment_id: item.equipamento_id,
          quantity: item.quantidade,
        })

        if (stockError) {
          console.error("Error updating equipment stock:", stockError)
        }
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/contratos")
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      setError(error.message || "Erro ao salvar contrato")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Contract Information */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-orange-500 text-lg font-semibold mb-6">Informações do Contrato</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente" className="text-gray-300 text-sm">
                      Cliente
                    </Label>
                    <Select
                      value={formData.cliente_id}
                      onValueChange={(value) => handleInputChange("cliente_id", value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-11">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_inicio" className="text-gray-300 text-sm">
                        Data de Início
                      </Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) => handleInputChange("data_inicio", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_fim" className="text-gray-300 text-sm">
                        Data de Fim
                      </Label>
                      <Input
                        id="data_fim"
                        type="date"
                        value={formData.data_fim}
                        onChange={(e) => handleInputChange("data_fim", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm">Status do Contrato</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-11">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm">Status de Pagamento</Label>
                      <Select
                        value={formData.status_pagamento}
                        onValueChange={(value) => handleInputChange("status_pagamento", value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-11">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Valor Total (R$)</Label>
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                      <p className="text-3xl font-bold text-white">R$ {calculateTotal().toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {calculateDays() > 0
                          ? `${calculateDays()} dia(s) • R$ ${(calculateTotal() / calculateDays()).toFixed(2)}/dia`
                          : "Calculado automaticamente com base nos equipamentos selecionados"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-gray-300 text-sm">
                      Observações adicionais sobre o contrato...
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange("observacoes", e.target.value)}
                      placeholder="Digite observações..."
                      rows={4}
                      className="bg-gray-700 border-gray-600 text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading || items.length === 0}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Contrato
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/contratos")}
                      disabled={isLoading}
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 h-11"
                    >
                      Cancelar
                    </Button>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Equipment Selection */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-orange-500 text-lg font-semibold mb-4">Equipamentos Selecionados</h2>
                {items.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhum equipamento selecionado</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const availability = getAvailabilityStatus(item.equipamento?.stock_count)
                      const StatusIcon = availability.icon

                      return (
                        <div
                          key={item.equipamento_id}
                          className="flex items-center gap-3 bg-gray-700 rounded-lg p-3 border border-gray-600"
                        >
                          <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                            {item.equipamento?.imagem_url ? (
                              <Image
                                src={item.equipamento.imagem_url || "/placeholder.svg"}
                                alt={item.equipamento.nome}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{item.equipamento?.nome}</p>
                            <p className="text-gray-400 text-xs">R$ {item.valor_unitario.toFixed(2)}/dia</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className={`${availability.color} text-white text-xs px-2 py-0 h-5`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {availability.status}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {item.equipamento?.stock_count || 0} em estoque
                              </span>
                            </div>
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-2 mt-2">
                              <Label className="text-xs text-gray-400">Qtd:</Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.equipamento_id, item.quantidade - 1)}
                                  disabled={item.quantidade <= 1}
                                  className="h-6 w-6 p-0 bg-gray-600 border-gray-500 hover:bg-gray-500 text-white"
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  max={item.equipamento?.stock_count || 1}
                                  value={item.quantidade || 1}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    const num = val === "" ? 1 : Number.parseInt(val)
                                    updateItemQuantity(item.equipamento_id, num)
                                  }}
                                  className="h-6 w-12 text-center bg-gray-600 border-gray-500 text-white text-xs p-0"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.equipamento_id, item.quantidade + 1)}
                                  disabled={item.quantidade >= (item.equipamento?.stock_count || 1)}
                                  className="h-6 w-6 p-0 bg-gray-600 border-gray-500 hover:bg-gray-500 text-white"
                                >
                                  +
                                </Button>
                              </div>
                              <span className="text-xs text-gray-400">= R$ {item.valor_total.toFixed(2)}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.equipamento_id)}
                            className="text-red-400 hover:text-red-300 hover:bg-gray-600 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-orange-500 text-lg font-semibold mb-4">Equipamentos Disponíveis</h2>

                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar equipamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white h-11"
                    />
                  </div>
                </div>

                {/* Equipment List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredEquipments.length > 0 ? (
                    filteredEquipments.map((equipment) => {
                      const addedItem = items.find((item) => item.equipamento_id === equipment.id)
                      const addedQuantity = addedItem ? addedItem.quantidade : 0
                      const remainingStock = (equipment.stock_count || 0) - addedQuantity
                      const isFullyAdded = remainingStock <= 0

                      const availability = getAvailabilityStatus(equipment.stock_count)
                      const StatusIcon = availability.icon

                      return (
                        <div
                          key={equipment.id}
                          className={`flex items-center gap-3 rounded-lg p-3 border transition-all ${
                            addedItem
                              ? "bg-orange-900/20 border-orange-500"
                              : "bg-gray-700 border-gray-600 hover:border-orange-500"
                          }`}
                        >
                          <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                            {equipment.imagem_url ? (
                              <Image
                                src={equipment.imagem_url || "/placeholder.svg"}
                                alt={equipment.nome}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{equipment.nome}</p>
                            <p className="text-gray-400 text-xs">
                              {equipment.marca} • R$ {equipment.valor_diario.toFixed(2)}/dia
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge
                                variant="secondary"
                                className={`${availability.color} text-white text-xs px-2 py-0 h-5`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {availability.status}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {remainingStock} disponível
                                {addedQuantity > 0 && (
                                  <span className="text-orange-400"> • {addedQuantity} adicionado</span>
                                )}
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => addEquipmentToContract(equipment)}
                            disabled={isFullyAdded}
                            className={`h-9 px-4 text-sm flex-shrink-0 ${
                              isFullyAdded
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : addedItem
                                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                                  : "bg-orange-500 hover:bg-orange-600 text-white"
                            }`}
                          >
                            {isFullyAdded ? "Esgotado" : addedItem ? "Adicionar Mais" : "Adicionar"}
                          </Button>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum equipamento encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  )
}
