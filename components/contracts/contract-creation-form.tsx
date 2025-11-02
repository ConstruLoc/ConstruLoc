"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Minus,
  Search,
  X,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
} from "lucide-react"
import { ContractPhotoUpload } from "./contract-photo-upload"

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
    data_vencimento_pagamento: contract?.data_vencimento_pagamento || "",
    status: contract?.status || "pendente",
    status_pagamento: contract?.status_pagamento || "pendente",
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
  const [contractPhoto, setContractPhoto] = useState<File | null>(null)

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

      let equipmentsWithStock = (data || []).map((equipment) => ({
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

      // If editing a contract, add back the quantities from the current contract items
      if (contract?.id && contract?.itens_contrato) {
        equipmentsWithStock = equipmentsWithStock.map((equipment) => {
          const contractItem = contract.itens_contrato.find((item: any) => item.equipamento_id === equipment.id)
          if (contractItem) {
            return {
              ...equipment,
              stock_count: equipment.stock_count + contractItem.quantidade,
            }
          }
          return equipment
        })
      }

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
        foto_contrato: contractPhoto,
      }

      let contractId: string

      if (contract?.id) {
        const datesChanged = contract.data_inicio !== formData.data_inicio || contract.data_fim !== formData.data_fim

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

        if (datesChanged) {
          console.log("[v0] Dates changed, regenerating monthly payments...")

          // Delete old monthly payments
          await supabase.from("pagamentos_mensais").delete().eq("contrato_id", contractId)

          // Generate new monthly payments
          const generateResponse = await fetch("/api/generate-monthly-payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contratoId: contractId,
              dataInicio: formData.data_inicio,
              dataFim: formData.data_fim,
              valorTotal,
            }),
          })

          if (!generateResponse.ok) {
            console.error("[v0] Error regenerating monthly payments")
          } else {
            console.log("[v0] Monthly payments regenerated successfully")
          }
        }

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

        const generateResponse = await fetch("/api/generate-monthly-payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contratoId: contractId,
            dataInicio: formData.data_inicio,
            dataFim: formData.data_fim,
            valorTotal,
          }),
        })

        if (!generateResponse.ok) {
          console.error("[v0] Error generating monthly payments")
        }

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
                  {/* Cliente */}
                  <div className="space-y-2">
                    <Label htmlFor="cliente" className="text-gray-300 text-base md:text-sm">
                      Cliente
                    </Label>
                    <Select
                      value={formData.cliente_id}
                      onValueChange={(value) => handleInputChange("cliente_id", value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-base">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id} className="text-white hover:bg-gray-600">
                            {client.nome} {client.empresa ? `- ${client.empresa}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Endereço de Instalação */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="endereco_instalacao"
                      className="text-gray-300 text-base md:text-sm flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4 text-orange-500" />
                      Endereço de Instalação
                    </Label>
                    <Textarea
                      id="endereco_instalacao"
                      value={formData.endereco_instalacao}
                      onChange={(e) => handleInputChange("endereco_instalacao", e.target.value)}
                      placeholder="Digite o endereço onde o equipamento será instalado..."
                      rows={3}
                      className="bg-gray-700 border-gray-600 text-white resize-none text-base"
                    />
                    <p className="text-gray-400 text-xs">Local onde o equipamento será utilizado</p>
                  </div>

                  {/* Data de Início */}
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio" className="text-gray-300 text-base md:text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Data de Início
                    </Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => handleInputChange("data_inicio", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white text-base"
                      required
                    />
                  </div>

                  {/* Data de Fim */}
                  <div className="space-y-2">
                    <Label htmlFor="data_fim" className="text-gray-300 text-base md:text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      Data de Fim
                    </Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => handleInputChange("data_fim", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white text-base"
                      required
                    />
                  </div>

                  {/* Data de Vencimento do Pagamento */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="data_vencimento_pagamento"
                      className="text-gray-300 text-base md:text-sm flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4 text-orange-500" />
                      Data de Vencimento do Pagamento
                    </Label>
                    <Input
                      id="data_vencimento_pagamento"
                      type="date"
                      value={formData.data_vencimento_pagamento}
                      onChange={(e) => handleInputChange("data_vencimento_pagamento", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white text-base"
                    />
                    <p className="text-gray-400 text-xs">Notificação será enviada 5 dias antes desta data</p>
                  </div>

                  {/* Status do Contrato e Status de Pagamento - lado a lado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-gray-300 text-base md:text-sm">
                        Status do Contrato
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-base">
                          <SelectValue placeholder="Pendente" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="pendente" className="text-white hover:bg-gray-600">
                            Pendente
                          </SelectItem>
                          <SelectItem value="ativo" className="text-white hover:bg-gray-600">
                            Ativo
                          </SelectItem>
                          <SelectItem value="concluido" className="text-white hover:bg-gray-600">
                            Concluído
                          </SelectItem>
                          <SelectItem value="cancelado" className="text-white hover:bg-gray-600">
                            Cancelado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status_pagamento" className="text-gray-300 text-base md:text-sm">
                        Status de Pagamento
                      </Label>
                      <Select
                        value={formData.status_pagamento}
                        onValueChange={(value) => handleInputChange("status_pagamento", value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-base">
                          <SelectValue placeholder="Pendente" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="pendente" className="text-white hover:bg-gray-600">
                            Pendente
                          </SelectItem>
                          <SelectItem value="pago" className="text-white hover:bg-gray-600">
                            Pago
                          </SelectItem>
                          <SelectItem value="atrasado" className="text-white hover:bg-gray-600">
                            Atrasado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Valor Mensal (R$) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300 text-base md:text-sm">Valor Mensal (R$)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInputChange("usar_valor_manual", !formData.usar_valor_manual)}
                        className="text-orange-500 hover:text-orange-400 hover:bg-transparent p-0 h-auto"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>

                    {formData.usar_valor_manual ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.valor_total_manual}
                        onChange={(e) =>
                          handleInputChange("valor_total_manual", Number.parseFloat(e.target.value) || 0)
                        }
                        className="bg-gray-700 border-gray-600 text-white text-3xl font-bold h-20 text-center"
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="bg-gray-700 p-6 rounded-lg">
                        <p className="text-white text-4xl font-bold text-center">R$ {calculateTotal().toFixed(2)}</p>
                      </div>
                    )}
                    <p className="text-gray-400 text-xs">
                      Valor mensal calculado com base nos equipamentos selecionados
                    </p>
                  </div>

                  {/* Observações */}
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

                  {/* Upload de Foto do Contrato */}
                  <ContractPhotoUpload
                    currentPhoto={contractPhoto}
                    onPhotoChange={setContractPhoto}
                    disabled={isLoading}
                  />

                  {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-base h-11"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>Salvar Contrato</>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/contratos")}
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-gray-600 text-white hover:bg-gray-700 text-base h-11"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Equipment Selection */}
          <div className="space-y-4 md:space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-orange-500 text-xl md:text-lg font-semibold mb-4 md:mb-6">
                  Equipamentos Selecionados
                </h2>

                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-base">Nenhum equipamento selecionado</p>
                    <p className="text-sm mt-2">Adicione equipamentos da lista ao lado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.equipamento_id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-medium text-base">{item.equipamento?.nome}</h3>
                            <p className="text-gray-400 text-sm">
                              {item.equipamento?.marca} - {item.equipamento?.modelo}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.equipamento_id)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.equipamento_id, item.quantidade - 1)}
                              disabled={item.quantidade <= 1}
                              className="h-8 w-8 p-0 bg-gray-600 border-gray-500"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-white font-medium w-12 text-center">{item.quantidade}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.equipamento_id, item.quantidade + 1)}
                              disabled={item.quantidade >= (item.equipamento?.stock_count || 1)}
                              className="h-8 w-8 p-0 bg-gray-600 border-gray-500"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs">Valor Total</p>
                            <p className="text-orange-500 font-bold text-lg">R$ {item.valor_total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-orange-500 text-xl md:text-lg font-semibold mb-4 md:mb-6">
                  Equipamentos Disponíveis
                </h2>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Buscar equipamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredEquipments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-base">Nenhum equipamento encontrado</p>
                    </div>
                  ) : (
                    filteredEquipments.map((equipment) => {
                      const availability = getAvailabilityStatus(equipment.stock_count)
                      const StatusIcon = availability.icon
                      const isAdded = items.some((item) => item.equipamento_id === equipment.id)

                      return (
                        <div
                          key={equipment.id}
                          className={`bg-gray-700 p-4 rounded-lg cursor-pointer transition-all ${
                            isAdded ? "ring-2 ring-orange-500" : "hover:bg-gray-600"
                          }`}
                          onClick={() => !isAdded && addEquipmentToContract(equipment)}
                        >
                          <div className="flex gap-3 mb-2">
                            <div className="flex-shrink-0">
                              {equipment.imagem_url ? (
                                <img
                                  src={equipment.imagem_url || "/placeholder.svg"}
                                  alt={equipment.nome}
                                  className="w-16 h-16 object-cover rounded-lg bg-gray-600"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                  <Package className="w-8 h-8 text-orange-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-white font-medium text-base truncate">{equipment.nome}</h3>
                                  <p className="text-gray-400 text-sm truncate">{equipment.marca}</p>
                                </div>
                                <div
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${availability.color} ml-2 flex-shrink-0`}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  <span>{equipment.stock_count || 0} disponível</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-orange-500 font-semibold text-base">
                                  {formatEquipmentPrice(equipment)}
                                </span>
                                {!isAdded && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 text-white h-8"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      addEquipmentToContract(equipment)
                                    }}
                                  >
                                    Adicionar
                                  </Button>
                                )}
                                {isAdded && <span className="text-orange-500 text-sm font-medium">Adicionado</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
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
