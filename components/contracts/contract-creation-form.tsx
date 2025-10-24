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
import {
  Loader2,
  Search,
  Package,
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
} from "lucide-react"
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
    data_vencimento_pagamento: contract?.data_inicio || "",
    status: contract?.status || "pendente",
    status_pagamento: "pendente",
    observacoes: contract?.observacoes || "",
    endereco_instalacao: contract?.endereco_instalacao || "",
    valor_total_manual: contract?.valor_total || 0,
    usar_valor_manual: false,
  })

  const [items, setItems] = useState<ContractItem[]>(contract?.itens_contrato || [])
  const [clients, setClients] = useState<Client[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (contract?.valor_total && items.length > 0) {
      const calculatedTotal = items.reduce((total, item) => total + (item.valor_total || 0), 0)
      if (Math.abs(contract.valor_total - calculatedTotal) > 0.01) {
        setFormData((prev) => ({
          ...prev,
          usar_valor_manual: true,
          valor_total_manual: contract.valor_total,
        }))
      }
    }
  }, [contract, items])

  useEffect(() => {
    const loadData = async () => {
      console.log("[v0] Loading contract form data...")
      setIsLoadingData(true)
      try {
        await Promise.all([fetchClients(), fetchEquipments()])
        console.log("[v0] Contract form data loaded successfully")
      } catch (error) {
        console.error("[v0] Error loading contract form data:", error)
        setError("Erro ao carregar dados. Por favor, recarregue a página.")
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    filterEquipments()
  }, [equipments, searchTerm])

  const fetchClients = async () => {
    try {
      console.log("[v0] Fetching clients...")
      const { data, error } = await supabase.from("clientes").select("id, nome, empresa, email, telefone").order("nome")

      if (error) {
        console.error("[v0] Error fetching clients:", error)
        throw error
      }

      console.log("[v0] Clients fetched:", data?.length || 0)
      setClients(data || [])
    } catch (error) {
      console.error("[v0] Error in fetchClients:", error)
      throw error
    }
  }

  const fetchEquipments = async () => {
    try {
      console.log("[v0] Fetching equipments...")
      const { data, error } = await supabase
        .from("equipamentos")
        .select(`
          id, nome, marca, modelo, valor_diario, valor_semanal, valor_mensal,
          imagem_url, categoria_id, status, localizacao, quantidade
        `)
        .eq("status", "disponivel")
        .order("nome")

      if (error) {
        console.error("[v0] Error fetching equipments:", error)
        throw error
      }

      console.log("[v0] Equipments fetched:", data?.length || 0)

      const equipmentsWithStock = (data || []).map((equipment) => ({
        ...equipment,
        valor_diario: equipment.valor_diario || 0,
        valor_semanal: equipment.valor_semanal || 0,
        valor_mensal: equipment.valor_mensal || 0,
        quantidade: equipment.quantidade || 0,
        stock_count: equipment.quantidade || 0,
        marca: equipment.marca || "Sem marca",
        modelo: equipment.modelo || "Sem modelo",
        imagem_url: equipment.imagem_url || null,
      }))

      setEquipments(equipmentsWithStock)
    } catch (error) {
      console.error("[v0] Error in fetchEquipments:", error)
      throw error
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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addEquipmentToContract = (equipment: Equipment) => {
    try {
      console.log("[v0] Adding equipment to contract:", equipment.id)
      const existingItem = items.find((item) => item.equipamento_id === equipment.id)

      if (existingItem) {
        updateItemQuantity(equipment.id, existingItem.quantidade + 1)
      } else {
        // Calculate monthly value for new items
        const monthlyValue = equipment.valor_mensal || equipment.valor_diario * 30 || 0
        const newItem: ContractItem = {
          equipamento_id: equipment.id,
          equipamento: equipment,
          quantidade: 1,
          valor_unitario: monthlyValue, // Default to monthly value
          valor_total: monthlyValue, // Default to monthly value
        }
        setItems((prev) => [...prev, newItem])
        console.log("[v0] Equipment added successfully")
      }
    } catch (error) {
      console.error("[v0] Error adding equipment:", error)
      setError("Erro ao adicionar equipamento. Tente novamente.")
    }
  }

  const updateItemQuantity = (equipmentId: string, newQuantity: number) => {
    try {
      setItems((prev) =>
        prev.map((item) => {
          if (item.equipamento_id === equipmentId) {
            const maxQuantity = item.equipamento?.stock_count || 1
            const quantity = Math.max(1, Math.min(newQuantity, maxQuantity))
            // Recalculate unit and total based on the monthly price set when added
            const monthlyValue = item.equipamento?.valor_mensal || 0
            return {
              ...item,
              quantidade: quantity,
              valor_unitario: monthlyValue, // Keep as monthly value
              valor_total: monthlyValue * quantity,
            }
          }
          return item
        }),
      )
    } catch (error) {
      console.error("[v0] Error updating quantity:", error)
      setError("Erro ao atualizar quantidade. Tente novamente.")
    }
  }

  const removeItem = (equipmentId: string) => {
    setItems((prev) => prev.filter((item) => item.equipamento_id !== equipmentId))
  }

  const calculateTotal = () => {
    try {
      if (formData.usar_valor_manual) {
        return formData.valor_total_manual
      }

      return items.reduce((total, item) => {
        const itemTotal = item.valor_total || 0
        return total + itemTotal
      }, 0)
    } catch (error) {
      console.error("[v0] Error calculating total:", error)
      return 0
    }
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

  const formatEquipmentPrice = (equipment: Equipment) => {
    if (equipment.valor_mensal && equipment.valor_mensal > 0) {
      return `R$ ${equipment.valor_mensal.toFixed(2)}/mês`
    }
    if (equipment.valor_semanal && equipment.valor_semanal > 0) {
      return `R$ ${equipment.valor_semanal.toFixed(2)}/sem`
    }
    if (equipment.valor_diario && equipment.valor_diario > 0) {
      return `R$ ${equipment.valor_diario.toFixed(2)}/dia`
    }
    return "Sem preço definido"
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
      const valorTotal = calculateTotal()

      console.log("[v0] Saving contract with valor_total:", valorTotal)

      const contractData = {
        cliente_id: formData.cliente_id,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        status: formData.status,
        observacoes: formData.observacoes,
        endereco_instalacao: formData.endereco_instalacao,
        valor_total: valorTotal,
      }

      let contractId: string

      if (contract?.id) {
        // Editing an existing contract
        const { data: oldItems } = await supabase
          .from("itens_contrato")
          .select("equipamento_id, quantidade")
          .eq("contrato_id", contract.id)

        if (oldItems) {
          // Restore stock for items that are being removed or changed
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

        // Delete old items before inserting new ones
        await supabase.from("itens_contrato").delete().eq("contrato_id", contractId)

        await supabase
          .from("pagamentos")
          .update({
            valor: valorTotal,
            data_vencimento: formData.data_vencimento_pagamento || formData.data_inicio,
          })
          .eq("contrato_id", contractId)
      } else {
        // Creating a new contract
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

        // Create associated payment entry
        const paymentData = {
          contrato_id: contractId,
          valor: valorTotal,
          data_vencimento: formData.data_vencimento_pagamento || formData.data_inicio,
          status: formData.status_pagamento,
          forma_pagamento: "A definir",
        }

        const { error: paymentError } = await supabase.from("pagamentos").insert([paymentData])

        if (paymentError) {
          console.error("Error creating payment:", paymentError)
        }
      }

      // Insert new contract items
      const itemsData = items.map((item) => ({
        contrato_id: contractId,
        equipamento_id: item.equipamento_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
      }))

      const { error: itemsError } = await supabase.from("itens_contrato").insert(itemsData)
      if (itemsError) throw itemsError

      // Update equipment stock
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

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white text-lg">Carregando dados do formulário...</p>
          <p className="text-gray-400 text-sm mt-2">Por favor, aguarde</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Column - Contract Information */}
          <div className="space-y-4 md:space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-orange-500 text-xl md:text-lg font-semibold mb-4 md:mb-6">
                  Informações do Contrato
                </h2>

                <div className="space-y-5 md:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente" className="text-gray-300 text-base md:text-sm">
                      Cliente
                    </Label>
                    <Select
                      value={formData.cliente_id}
                      onValueChange={(value) => handleInputChange("cliente_id", value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12 md:h-11 text-base">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id} className="text-base">
                            {client.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="endereco_instalacao"
                      className="text-gray-300 text-base md:text-sm flex items-center gap-2"
                    >
                      <MapPin className="h-5 w-5 md:h-4 md:w-4 text-orange-500" />
                      Endereço de Instalação
                    </Label>
                    <Textarea
                      id="endereco_instalacao"
                      value={formData.endereco_instalacao}
                      onChange={(e) => handleInputChange("endereco_instalacao", e.target.value)}
                      placeholder="Digite o endereço onde o equipamento será instalado..."
                      rows={3}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 resize-none text-base"
                    />
                    <p className="text-sm md:text-xs text-gray-500">Local onde o equipamento será utilizado</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_inicio" className="text-gray-300 text-base md:text-sm flex items-center gap-2">
                      <Calendar className="h-5 w-5 md:h-4 md:w-4 text-orange-500" />
                      Data de Início
                    </Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => {
                        handleInputChange("data_inicio", e.target.value)
                        if (
                          !formData.data_vencimento_pagamento ||
                          formData.data_vencimento_pagamento === formData.data_inicio
                        ) {
                          handleInputChange("data_vencimento_pagamento", e.target.value)
                        }
                      }}
                      className="bg-gray-700 border-gray-600 text-white h-12 md:h-11 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_fim" className="text-gray-300 text-base md:text-sm flex items-center gap-2">
                      <Calendar className="h-5 w-5 md:h-4 md:w-4 text-orange-500" />
                      Data de Fim
                    </Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => handleInputChange("data_fim", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-12 md:h-11 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="data_vencimento_pagamento"
                      className="text-gray-300 text-base md:text-sm flex items-center gap-2"
                    >
                      <DollarSign className="h-5 w-5 md:h-4 md:w-4 text-orange-500" />
                      Data de Vencimento do Pagamento
                    </Label>
                    <Input
                      id="data_vencimento_pagamento"
                      type="date"
                      value={formData.data_vencimento_pagamento}
                      onChange={(e) => handleInputChange("data_vencimento_pagamento", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-12 md:h-11 text-base"
                      required
                    />
                    <p className="text-sm md:text-xs text-gray-500">Notificação será enviada 5 dias antes desta data</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-base md:text-sm">Status do Contrato</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12 md:h-11 text-base">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente" className="text-base">
                            Pendente
                          </SelectItem>
                          <SelectItem value="ativo" className="text-base">
                            Ativo
                          </SelectItem>
                          <SelectItem value="finalizado" className="text-base">
                            Finalizado
                          </SelectItem>
                          <SelectItem value="cancelado" className="text-base">
                            Cancelado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 text-base md:text-sm">Status de Pagamento</Label>
                      <Select
                        value={formData.status_pagamento}
                        onValueChange={(value) => handleInputChange("status_pagamento", value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12 md:h-11 text-base">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente" className="text-base">
                            Pendente
                          </SelectItem>
                          <SelectItem value="pago" className="text-base">
                            Pago
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300 text-base md:text-sm">Valor Total (R$)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const novoValor = !formData.usar_valor_manual
                          if (novoValor) {
                            const calculatedTotal = items.reduce((total, item) => total + (item.valor_total || 0), 0)
                            handleInputChange("valor_total_manual", calculatedTotal)
                          }
                          handleInputChange("usar_valor_manual", novoValor)
                        }}
                        className="text-orange-500 hover:text-orange-400 hover:bg-gray-700 h-8 text-xs"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        {formData.usar_valor_manual ? "Automático" : "Editar"}
                      </Button>
                    </div>

                    {formData.usar_valor_manual ? (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.valor_total_manual}
                          onChange={(e) =>
                            handleInputChange("valor_total_manual", Number.parseFloat(e.target.value) || 0)
                          }
                          className="bg-gray-700 border-gray-600 text-white h-12 md:h-11 text-base"
                          placeholder="0.00"
                        />
                        <p className="text-sm md:text-xs text-orange-400">
                          Modo manual ativado. Valor calculado: R${" "}
                          {items.reduce((total, item) => total + (item.valor_total || 0), 0).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                        <p className="text-4xl md:text-3xl font-bold text-white">R$ {calculateTotal().toFixed(2)}</p>
                        <p className="text-sm md:text-xs text-gray-400 mt-1">
                          Calculado com base nos equipamentos selecionados
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-gray-300 text-base md:text-sm">
                      Observações
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange("observacoes", e.target.value)}
                      placeholder="Observações adicionais sobre o contrato..."
                      rows={4}
                      className="bg-gray-700 border-gray-600 text-white resize-none text-base"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading || items.length === 0}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12 md:h-11 text-base font-medium"
                    >
                      {isLoading && <Loader2 className="mr-2 h-5 w-5 md:h-4 md:w-4 animate-spin" />}
                      Salvar Contrato
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/contratos")}
                      disabled={isLoading}
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 h-12 md:h-11 text-base font-medium"
                    >
                      Cancelar
                    </Button>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                      <p className="text-base md:text-sm text-red-400">{error}</p>
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
                            <p className="text-gray-400 text-xs">R$ {item.valor_unitario.toFixed(2)}/mês</p>{" "}
                            {/* Display monthly price */}
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
                              <span className="text-xs text-gray-400">= R$ {item.valor_total.toFixed(2)}</span>{" "}
                              {/* Display total for this item */}
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
              <CardContent className="p-4 md:p-6">
                <h2 className="text-orange-500 text-lg md:text-xl font-semibold mb-4">Equipamentos Disponíveis</h2>

                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 md:h-4 md:w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar equipamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white h-12 md:h-11 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredEquipments.length > 0 ? (
                    filteredEquipments.map((equipment) => {
                      const addedItem = items.find((item) => item.equipamento_id === equipment.id)
                      const addedQuantity = addedItem ? addedItem.quantidade : 0
                      const remainingStock = Math.max(0, (equipment.stock_count || 0) - addedQuantity)
                      const isFullyAdded = remainingStock <= 0

                      const availability = getAvailabilityStatus(equipment.stock_count)
                      const StatusIcon = availability.icon

                      return (
                        <div
                          key={equipment.id}
                          className={`rounded-lg p-4 border-2 transition-all ${
                            addedItem
                              ? "bg-orange-900/20 border-orange-500"
                              : "bg-gray-700 border-gray-600 hover:border-orange-500"
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-16 h-16 md:w-14 md:h-14 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                              {equipment.imagem_url ? (
                                <Image
                                  src={equipment.imagem_url || "/placeholder.svg"}
                                  alt={equipment.nome}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-7 w-7 md:h-6 md:w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-base md:text-sm leading-tight mb-1">
                                {equipment.nome}
                              </p>
                              <p className="text-gray-400 text-sm md:text-xs mb-2">{equipment.marca}</p>
                              <p className="text-orange-400 font-bold text-base md:text-sm">
                                {formatEquipmentPrice(equipment)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge
                              variant="secondary"
                              className={`${availability.color} text-white text-sm md:text-xs px-3 py-1 md:px-2 md:py-0 h-7 md:h-5`}
                            >
                              <StatusIcon className="h-4 w-4 md:h-3 md:w-3 mr-1" />
                              {availability.status}
                            </Badge>
                            <span className="text-sm md:text-xs text-gray-300 font-medium">
                              {remainingStock} disponível
                            </span>
                            {addedQuantity > 0 && (
                              <span className="text-sm md:text-xs text-orange-400 font-medium">
                                • {addedQuantity} selecionado
                              </span>
                            )}
                          </div>

                          <Button
                            type="button"
                            onClick={() => addEquipmentToContract(equipment)}
                            disabled={isFullyAdded}
                            className={`w-full h-12 md:h-10 text-base md:text-sm font-semibold ${
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
                      <p className="text-base">Nenhum equipamento encontrado</p>
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
