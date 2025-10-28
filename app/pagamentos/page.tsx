"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Download,
  DollarSign,
  CheckCircle2,
  Edit,
  Trash2,
  Archive,
  FileText,
  Calendar,
  CreditCard,
  AlertCircle,
  Package,
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { SimpleModal, SimpleAlertModal } from "@/components/ui/simple-modal"
import { useRouter } from "next/navigation"

interface ContractPayment {
  id: string
  numero_contrato: string
  valor_total: number
  status: string
  status_pagamento: string
  pagamento_id: string
  data_inicio: string
  data_fim: string
  clientes: {
    nome: string
    empresa?: string
  }
}

interface OrphanedPayment {
  id: string
  contrato_numero: string
  valor: number
  status: string
  data_pagamento: string
  contrato_excluido: boolean
  cliente_nome?: string
  cliente_empresa?: string
  equipamentos_info?: Array<{
    nome: string
    marca: string
    modelo: string
    quantidade: number
  }>
}

function calculatePendingMonths(dataInicio: string, dataFim: string, statusPagamento: string) {
  if (statusPagamento !== "pendente") {
    return null
  }

  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  const hoje = new Date()

  // Se o contrato ainda não começou, não há meses pendentes
  if (inicio > hoje) {
    return null
  }

  // Calcular quantos meses se passaram desde o início
  const mesesPassados = []
  const dataAtual = new Date(inicio)

  while (dataAtual <= hoje && dataAtual <= fim) {
    mesesPassados.push({
      mes: dataAtual.toLocaleDateString("pt-BR", { month: "long" }),
      ano: dataAtual.getFullYear(),
      mesAno: `${dataAtual.toLocaleDateString("pt-BR", { month: "short" })}/${dataAtual.getFullYear()}`,
    })
    dataAtual.setMonth(dataAtual.getMonth() + 1)
  }

  if (mesesPassados.length === 0) {
    return null
  }

  return {
    quantidade: mesesPassados.length,
    meses: mesesPassados,
    mensagem: `${mesesPassados.length} ${mesesPassados.length === 1 ? "mês atrasado" : "meses atrasados"}`,
  }
}

export default function PagamentosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [contracts, setContracts] = useState<ContractPayment[]>([])
  const [filteredContracts, setFilteredContracts] = useState<ContractPayment[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const [orphanedPayments, setOrphanedPayments] = useState<OrphanedPayment[]>([])
  const [deleteOrphanedState, setDeleteOrphanedState] = useState<{
    isOpen: boolean
    paymentId: string | null
    contractNumber: string
  }>({
    isOpen: false,
    paymentId: null,
    contractNumber: "",
  })

  const [markPaidConfirmState, setMarkPaidConfirmState] = useState<{
    isOpen: boolean
    paymentId: string | null
    contractNumber: string
  }>({
    isOpen: false,
    paymentId: null,
    contractNumber: "",
  })

  const [editDialogState, setEditDialogState] = useState<{
    isOpen: boolean
    paymentId: string | null
    contractNumber: string
    currentStatus: string
    newStatus: string
  }>({
    isOpen: false,
    paymentId: null,
    contractNumber: "",
    currentStatus: "",
    newStatus: "",
  })

  const [contractDetailsState, setContractDetailsState] = useState<{
    isOpen: boolean
    payment: OrphanedPayment | null
  }>({
    isOpen: false,
    payment: null,
  })

  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchContracts()
    fetchOrphanedPayments()
  }, [])

  useEffect(() => {
    filterContracts()
  }, [contracts, searchTerm, statusFilter])

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from("contratos")
        .select(
          `
          id,
          numero_contrato,
          valor_total,
          status,
          data_inicio,
          data_fim,
          clientes (
            nome,
            empresa
          ),
          pagamentos (
            id,
            status
          )
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error

      const transformedData = (data || []).map((contract: any) => ({
        ...contract,
        status_pagamento: contract.pagamentos?.[0]?.status || "pendente",
        pagamento_id: contract.pagamentos?.[0]?.id || null,
      }))

      setContracts(transformedData)
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrphanedPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
        .is("contrato_id", null)
        .eq("contrato_excluido", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrphanedPayments(data || [])
    } catch (error) {
      console.error("Error fetching orphaned payments:", error)
    }
  }

  const handleDeleteOrphanedPayment = async () => {
    const { paymentId, contractNumber } = deleteOrphanedState

    if (!paymentId) return

    try {
      const { error } = await supabase.from("pagamentos").delete().eq("id", paymentId)

      if (error) throw error

      setOrphanedPayments((prev) => prev.filter((p) => p.id !== paymentId))
      setDeleteOrphanedState({ isOpen: false, paymentId: null, contractNumber: "" })

      toast({
        title: "Pagamento excluído!",
        description: `Registro de pagamento do contrato ${contractNumber} foi excluído permanentemente.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting orphaned payment:", error)
      setDeleteOrphanedState({ isOpen: false, paymentId: null, contractNumber: "" })

      toast({
        title: "Erro ao excluir pagamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  const filterContracts = () => {
    let filtered = contracts

    if (searchTerm) {
      filtered = filtered.filter(
        (contract) =>
          contract.numero_contrato.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.clientes?.empresa?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((contract) => contract.status_pagamento === statusFilter)
    }

    setFilteredContracts(filtered)
  }

  const isPaymentOverdue = (dataFim: string, statusPagamento: string) => {
    if (statusPagamento !== "pendente") {
      return false
    }
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0) // Zerar horas para comparação apenas de data
    const fim = new Date(dataFim)
    fim.setHours(0, 0, 0, 0)
    return fim < hoje
  }

  const getStatusColor = (status: string, dataFim?: string) => {
    if (dataFim && status === "pendente" && isPaymentOverdue(dataFim, status)) {
      return "bg-red-500/20 text-red-400 border-red-500/30"
    }

    switch (status) {
      case "pago":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pendente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "parcial":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "cancelado":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusLabel = (status: string, dataFim?: string) => {
    if (dataFim && status === "pendente" && isPaymentOverdue(dataFim, status)) {
      return "Atrasado"
    }

    switch (status) {
      case "pago":
        return "Pago"
      case "pendente":
        return "Pendente"
      case "parcial":
        return "Parcial"
      case "cancelado":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleEditStatusClick = (paymentId: string, numero: string, currentStatus: string) => {
    setEditDialogState({
      isOpen: true,
      paymentId: paymentId,
      contractNumber: numero,
      currentStatus: currentStatus,
      newStatus: currentStatus,
    })
  }

  const handleUpdateStatus = async () => {
    const { paymentId, contractNumber, newStatus } = editDialogState

    if (!paymentId) return

    try {
      const { error } = await supabase.from("pagamentos").update({ status: newStatus }).eq("id", paymentId)

      if (error) throw error

      setContracts((prev) =>
        prev.map((c) => (c.pagamento_id === paymentId ? { ...c, status_pagamento: newStatus } : c)),
      )

      setEditDialogState({
        isOpen: false,
        paymentId: null,
        contractNumber: "",
        currentStatus: "",
        newStatus: "",
      })

      toast({
        title: "Status atualizado!",
        description: `Status do contrato ${contractNumber} foi alterado para ${getStatusLabel(newStatus)}.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      setEditDialogState({
        isOpen: false,
        paymentId: null,
        contractNumber: "",
        currentStatus: "",
        newStatus: "",
      })

      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsPaidClick = (paymentId: string, numero: string) => {
    console.log("[v0] handleMarkAsPaidClick called:", numero, paymentId)
    setMarkPaidConfirmState({
      isOpen: true,
      paymentId: paymentId,
      contractNumber: numero,
    })
    console.log("[v0] markPaidConfirmState set to open")
  }

  const handleMarkAsPaid = async () => {
    const { paymentId, contractNumber } = markPaidConfirmState

    if (!paymentId) return

    try {
      const { error } = await supabase.from("pagamentos").update({ status: "pago" }).eq("id", paymentId)

      if (error) throw error

      setContracts((prev) => prev.map((c) => (c.pagamento_id === paymentId ? { ...c, status_pagamento: "pago" } : c)))

      setMarkPaidConfirmState({ isOpen: false, paymentId: null, contractNumber: "" })

      toast({
        title: "Pagamento confirmado!",
        description: `Contrato ${contractNumber} marcado como pago com sucesso.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error marking payment as paid:", error)
      setMarkPaidConfirmState({ isOpen: false, paymentId: null, contractNumber: "" })

      toast({
        title: "Erro ao marcar como pago",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  const calculateTotals = () => {
    const total = contracts.reduce((sum, contract) => sum + (contract.valor_total || 0), 0)
    const pending = contracts
      .filter((c) => c.status_pagamento === "pendente")
      .reduce((sum, contract) => sum + (contract.valor_total || 0), 0)
    const paid = contracts
      .filter((c) => c.status_pagamento === "pago")
      .reduce((sum, contract) => sum + (contract.valor_total || 0), 0)

    const orphanedTotal = orphanedPayments
      .filter((p) => p.status === "pago")
      .reduce((sum, payment) => sum + (payment.valor || 0), 0)

    return { total, pending, paid: paid + orphanedTotal, orphanedTotal }
  }

  const totals = calculateTotals()

  const handleContractDetailsClick = (payment: OrphanedPayment) => {
    setContractDetailsState({ isOpen: true, payment })
  }

  const handleContractClick = (contractId: string) => {
    router.push(`/contratos/${contractId}`)
  }

  return (
    <MainLayout showBackButton={true} title="Pagamentos">
      <div className="p-4 md:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-6 md:h-8 w-6 md:w-8 text-orange-500" />
              Pagamentos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Controle financeiro e cobrança</p>
            <div className="h-1 w-20 bg-orange-500 rounded-full mt-2"></div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="icon-hover bg-transparent flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription>Total em Contratos</CardDescription>
              <CardTitle className="text-xl md:text-2xl text-orange-500">R$ {totals.total.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription>Pagamentos Pendentes</CardDescription>
              <CardTitle className="text-xl md:text-2xl text-yellow-500">R$ {totals.pending.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription>Pagamentos Recebidos</CardDescription>
              <CardTitle className="text-xl md:text-2xl text-green-500">R$ {totals.paid.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
            <Input
              placeholder="Buscar por cliente ou contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="animate-slide-up bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle>Contratos e Pagamentos</CardTitle>
            <CardDescription>Gerencie os pagamentos de todos os contratos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Nenhum contrato encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredContracts.map((contract) => {
                          const pendingInfo = calculatePendingMonths(
                            contract.data_inicio,
                            contract.data_fim,
                            contract.status_pagamento,
                          )

                          return (
                            <TableRow
                              key={contract.id}
                              onClick={() => handleContractClick(contract.id)}
                              className="cursor-pointer hover:bg-gray-700/30 transition-colors"
                            >
                              <TableCell className="font-medium text-orange-400">{contract.numero_contrato}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{contract.clientes?.nome}</div>
                                  {contract.clientes?.empresa && (
                                    <div className="text-sm text-muted-foreground">{contract.clientes.empresa}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{contract.data_inicio.split("-").reverse().join("/")}</div>
                                  <div className="text-muted-foreground">
                                    até {contract.data_fim.split("-").reverse().join("/")}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-orange-500">
                                R$ {contract.valor_total?.toFixed(2) || "0.00"}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <Badge className={getStatusColor(contract.status_pagamento, contract.data_fim)}>
                                    {getStatusLabel(contract.status_pagamento, contract.data_fim)}
                                  </Badge>
                                  {pendingInfo && (
                                    <div className="text-xs text-yellow-400 font-medium">
                                      {pendingInfo.mensagem}
                                      <div className="text-muted-foreground mt-0.5">
                                        {pendingInfo.meses
                                          .slice(0, 3)
                                          .map((m) => m.mesAno)
                                          .join(", ")}
                                        {pendingInfo.quantidade > 3 && "..."}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {console.log(
                                    "[v0] Contract:",
                                    contract.numero_contrato,
                                    "Payment ID:",
                                    contract.pagamento_id,
                                    "Status:",
                                    contract.status_pagamento,
                                  )}
                                  {contract.status_pagamento === "pendente" && contract.pagamento_id && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        console.log("[v0] Marcar como pago button clicked:", contract.numero_contrato)
                                        handleMarkAsPaidClick(contract.pagamento_id, contract.numero_contrato)
                                      }}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Marcar como Pago
                                    </Button>
                                  )}
                                  {contract.pagamento_id && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        console.log("[v0] Editar status clicked:", contract.numero_contrato)
                                        handleEditStatusClick(
                                          contract.pagamento_id,
                                          contract.numero_contrato,
                                          contract.status_pagamento,
                                        )
                                      }}
                                      className="bg-transparent border-gray-600 hover:bg-gray-700"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Editar Status
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden space-y-4">
                  {filteredContracts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">Nenhum contrato encontrado</div>
                  ) : (
                    filteredContracts.map((contract) => {
                      const pendingInfo = calculatePendingMonths(
                        contract.data_inicio,
                        contract.data_fim,
                        contract.status_pagamento,
                      )

                      return (
                        <Card
                          key={contract.id}
                          className="bg-gray-900 border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors"
                          onClick={() => handleContractClick(contract.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="font-medium text-orange-400 text-lg mb-1">
                                  {contract.numero_contrato}
                                </div>
                                <div className="font-medium">{contract.clientes?.nome}</div>
                                {contract.clientes?.empresa && (
                                  <div className="text-sm text-muted-foreground">{contract.clientes.empresa}</div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2 text-sm mb-4">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Período:</span>
                                <span className="text-right">
                                  {contract.data_inicio.split("-").reverse().join("/")} até{" "}
                                  {contract.data_fim.split("-").reverse().join("/")}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Valor:</span>
                                <span className="font-medium text-orange-500">
                                  R$ {contract.valor_total?.toFixed(2) || "0.00"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status:</span>
                                <div className="text-right space-y-1">
                                  <Badge className={getStatusColor(contract.status_pagamento, contract.data_fim)}>
                                    {getStatusLabel(contract.status_pagamento, contract.data_fim)}
                                  </Badge>
                                  {pendingInfo && (
                                    <div className="text-xs text-yellow-400 font-medium">
                                      {pendingInfo.mensagem}
                                      <div className="text-muted-foreground mt-0.5">
                                        {pendingInfo.meses
                                          .slice(0, 2)
                                          .map((m) => m.mesAno)
                                          .join(", ")}
                                        {pendingInfo.quantidade > 2 && "..."}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {contract.status_pagamento === "pendente" && contract.pagamento_id && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkAsPaidClick(contract.pagamento_id, contract.numero_contrato)
                                  }}
                                  className="bg-green-600 hover:bg-green-700 w-full"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Marcar como Pago
                                </Button>
                              )}
                              {contract.pagamento_id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditStatusClick(
                                      contract.pagamento_id,
                                      contract.numero_contrato,
                                      contract.status_pagamento,
                                    )
                                  }}
                                  className="bg-transparent border-gray-600 hover:bg-gray-700 w-full"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Status
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {orphanedPayments.length > 0 && (
          <Card className="animate-slide-up bg-gray-800/50 border-gray-700 border-orange-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-orange-500" />
                    Pagamentos de Contratos Excluídos
                  </CardTitle>
                  <CardDescription>
                    Histórico de pagamentos de contratos que foram excluídos (Total: R${" "}
                    {totals.orphanedTotal.toFixed(2)})
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data de Pagamento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orphanedPayments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        className="cursor-pointer hover:bg-gray-700/30 transition-colors"
                        onClick={() => handleContractDetailsClick(payment)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-orange-400" />
                            <span className="text-orange-400">{payment.contrato_numero || "N/A"}</span>
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Excluído</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.cliente_nome || "N/A"}</div>
                            {payment.cliente_empresa && (
                              <div className="text-sm text-muted-foreground">{payment.cliente_empresa}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.data_pagamento
                            ? new Date(payment.data_pagamento).toLocaleDateString("pt-BR")
                            : "Não registrada"}
                        </TableCell>
                        <TableCell className="font-medium text-green-500">
                          R$ {payment.valor?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>{getStatusLabel(payment.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteOrphanedState({
                                isOpen: true,
                                paymentId: payment.id,
                                contractNumber: payment.contrato_numero || "N/A",
                              })
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Permanentemente
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-4">
                {orphanedPayments.map((payment) => (
                  <Card
                    key={payment.id}
                    className="bg-gray-900 border-gray-700 border-orange-500/30 cursor-pointer hover:bg-gray-800/50 transition-colors"
                    onClick={() => handleContractDetailsClick(payment)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-orange-400 text-lg">
                              {payment.contrato_numero || "N/A"}
                            </span>
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">Excluído</Badge>
                          </div>
                          <div className="font-medium">{payment.cliente_nome || "N/A"}</div>
                          {payment.cliente_empresa && (
                            <div className="text-sm text-muted-foreground">{payment.cliente_empresa}</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data de Pagamento:</span>
                          <span>
                            {payment.data_pagamento
                              ? new Date(payment.data_pagamento).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Não registrada"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-medium text-green-500">R$ {payment.valor?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={getStatusColor(payment.status)}>{getStatusLabel(payment.status)}</Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteOrphanedState({
                            isOpen: true,
                            paymentId: payment.id,
                            contractNumber: payment.contrato_numero || "N/A",
                          })
                        }}
                        className="bg-red-600 hover:bg-red-700 w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Permanentemente
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <SimpleModal
        isOpen={contractDetailsState.isOpen}
        onClose={() => setContractDetailsState({ isOpen: false, payment: null })}
        title="Detalhes do Contrato"
        description="Informações do pagamento registrado"
        icon={<FileText className="h-6 w-6 text-orange-500" />}
        maxWidth="max-w-2xl"
      >
        {contractDetailsState.payment && (
          <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-200">
                <p className="font-semibold mb-1">Contrato Excluído</p>
                <p className="text-yellow-200/80">
                  Este contrato foi excluído do sistema. As informações abaixo são do histórico de pagamento.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <FileText className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Número do Contrato</p>
                  <p className="font-semibold text-orange-400">
                    {contractDetailsState.payment.contrato_numero || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Valor do Pagamento</p>
                  <p className="font-semibold text-green-500">
                    R$ {contractDetailsState.payment.valor?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                  <p className="font-semibold">
                    {contractDetailsState.payment.data_pagamento
                      ? new Date(contractDetailsState.payment.data_pagamento).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "Não registrada"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <CreditCard className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Status do Pagamento</p>
                  <Badge className={getStatusColor(contractDetailsState.payment.status)}>
                    {getStatusLabel(contractDetailsState.payment.status)}
                  </Badge>
                </div>
              </div>

              {contractDetailsState.payment.equipamentos_info &&
                contractDetailsState.payment.equipamentos_info.length > 0 && (
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-5 w-5 text-orange-500" />
                      <p className="text-sm text-muted-foreground font-semibold">Equipamentos Alugados</p>
                    </div>
                    <div className="space-y-2">
                      {contractDetailsState.payment.equipamentos_info.map((equip, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-700/50 rounded border border-gray-600"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{equip.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {equip.marca} {equip.modelo && `• ${equip.modelo}`}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            Qtd: {equip.quantidade}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => setContractDetailsState({ isOpen: false, payment: null })}
                className="bg-transparent"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </SimpleModal>

      <SimpleAlertModal
        isOpen={deleteOrphanedState.isOpen}
        onClose={() => setDeleteOrphanedState({ isOpen: false, paymentId: null, contractNumber: "" })}
        onConfirm={handleDeleteOrphanedPayment}
        title="Excluir Pagamento Permanentemente"
        description={`Tem certeza que deseja excluir permanentemente o registro de pagamento do contrato "${deleteOrphanedState.contractNumber}"?\n\nEsta ação não pode ser desfeita! O histórico de pagamento será perdido.`}
        icon={<Trash2 className="h-6 w-6 text-red-500 bg-red-500/10 p-2 rounded-full" />}
        confirmText="Excluir Permanentemente"
        cancelText="Cancelar"
        confirmVariant="destructive"
      />

      <SimpleAlertModal
        isOpen={markPaidConfirmState.isOpen}
        onClose={() => {
          console.log("[v0] SimpleAlertModal closed")
          setMarkPaidConfirmState({ isOpen: false, paymentId: null, contractNumber: "" })
        }}
        onConfirm={() => {
          console.log("[v0] SimpleAlertModal confirmed")
          handleMarkAsPaid()
        }}
        title="Confirmar Pagamento"
        description={`Tem certeza que deseja marcar o contrato "${markPaidConfirmState.contractNumber}" como pago?\n\nEsta ação atualizará o status do pagamento para "Pago".`}
        icon={<CheckCircle2 className="h-6 w-6 text-green-500 bg-green-500/10 p-2 rounded-full" />}
        confirmText="Confirmar Pagamento"
        cancelText="Cancelar"
        confirmVariant="success"
      />

      <SimpleModal
        isOpen={editDialogState.isOpen}
        onClose={() =>
          setEditDialogState({
            isOpen: false,
            paymentId: null,
            contractNumber: "",
            currentStatus: "",
            newStatus: "",
          })
        }
        title="Editar Status do Pagamento"
        description={`Alterar status do contrato ${editDialogState.contractNumber}`}
        icon={<Edit className="h-6 w-6 text-orange-500" />}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Novo Status</label>
            <Select
              value={editDialogState.newStatus}
              onValueChange={(value) =>
                setEditDialogState((prev) => ({
                  ...prev,
                  newStatus: value,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() =>
                setEditDialogState({
                  isOpen: false,
                  paymentId: null,
                  contractNumber: "",
                  currentStatus: "",
                  newStatus: "",
                })
              }
              className="bg-transparent"
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} className="bg-orange-500 hover:bg-orange-600">
              Salvar Alterações
            </Button>
          </div>
        </div>
      </SimpleModal>
    </MainLayout>
  )
}
