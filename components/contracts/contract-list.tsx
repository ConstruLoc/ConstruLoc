"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  FileText,
  XCircle,
  AlertTriangle,
  Download,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Contract {
  id: string
  numero_contrato: string
  data_inicio: string
  data_fim: string
  valor_total: number
  status: string
  clientes: {
    nome: string
    empresa: string
  }
}

export function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean
    contractId: string | null
    contractNumber: string
    itemCount: number
  }>({
    isOpen: false,
    contractId: null,
    contractNumber: "",
    itemCount: 0,
  })
  const [cancelConfirmState, setCancelConfirmState] = useState<{
    isOpen: boolean
    contractId: string | null
    contractNumber: string
  }>({
    isOpen: false,
    contractId: null,
    contractNumber: "",
  })
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchContracts()
  }, [])

  useEffect(() => {
    filterContracts()
  }, [contracts, searchTerm, statusFilter])

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
          clientes (
            nome,
            empresa
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setContracts(data || [])
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setIsLoading(false)
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
      filtered = filtered.filter((contract) => contract.status === statusFilter)
    }

    setFilteredContracts(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "ativo":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pendente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "finalizado":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "cancelado":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pago":
        return "Pago"
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

  const handleDeleteClick = async (id: string, numero: string) => {
    try {
      // Fetch contract items count
      const { data: items, error } = await supabase
        .from("itens_contrato")
        .select("equipamento_id, quantidade")
        .eq("contrato_id", id)

      if (error) throw error

      setDeleteConfirmState({
        isOpen: true,
        contractId: id,
        contractNumber: numero,
        itemCount: items?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching contract items:", error)
      alert("Erro ao buscar informações do contrato")
    }
  }

  const handleDelete = async () => {
    const { contractId, contractNumber } = deleteConfirmState

    if (!contractId) return

    try {
      const { data: contractData, error: contractFetchError } = await supabase
        .from("contratos")
        .select(`
          *,
          clientes (
            nome,
            empresa
          )
        `)
        .eq("id", contractId)
        .single()

      if (contractFetchError) throw contractFetchError

      // 1. Fetch contract items to return equipment to stock
      const { data: contractItems, error: fetchError } = await supabase
        .from("itens_contrato")
        .select(`
          equipamento_id,
          quantidade,
          equipamentos (
            nome,
            marca,
            modelo
          )
        `)
        .eq("contrato_id", contractId)

      if (fetchError) throw fetchError

      // 2. Return equipment to stock
      if (contractItems && contractItems.length > 0) {
        for (const item of contractItems) {
          const { error: stockError } = await supabase.rpc("increment_equipment_stock", {
            equipment_id: item.equipamento_id,
            quantity: item.quantidade,
          })

          if (stockError) {
            console.error("Error returning equipment to stock:", stockError)
            throw stockError
          }
        }
      }

      const equipmentDetails =
        contractItems?.map((item: any) => ({
          nome: item.equipamentos?.nome || "Equipamento",
          marca: item.equipamentos?.marca || "",
          modelo: item.equipamentos?.modelo || "",
          quantidade: item.quantidade,
        })) || []

      // 3. Delete contract items
      const { error: itemsError } = await supabase.from("itens_contrato").delete().eq("contrato_id", contractId)

      if (itemsError) throw itemsError

      const { error: paymentsError } = await supabase
        .from("pagamentos")
        .update({
          contrato_excluido: true,
          contrato_numero: contractNumber,
          cliente_nome: contractData.clientes?.nome || null,
          cliente_empresa: contractData.clientes?.empresa || null,
          data_pagamento: contractData.data_fim || null,
          equipamentos_info: equipmentDetails,
        })
        .eq("contrato_id", contractId)

      if (paymentsError) throw paymentsError

      // 4. Delete contract
      const { error: contractError } = await supabase.from("contratos").delete().eq("id", contractId)

      if (contractError) throw contractError

      // 5. Update local state
      setContracts((prev) => prev.filter((c) => c.id !== contractId))

      // Close dialog
      setDeleteConfirmState({ isOpen: false, contractId: null, contractNumber: "", itemCount: 0 })

      toast({
        title: "Contrato excluído!",
        description: `Contrato ${contractNumber} excluído com sucesso. Equipamentos devolvidos ao estoque e histórico de pagamentos preservado.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting contract:", error)
      setDeleteConfirmState({ isOpen: false, contractId: null, contractNumber: "", itemCount: 0 })

      toast({
        title: "Erro ao excluir contrato",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  const handleCancelClick = (id: string, numero: string) => {
    setCancelConfirmState({
      isOpen: true,
      contractId: id,
      contractNumber: numero,
    })
  }

  const handleCancel = async () => {
    const { contractId, contractNumber } = cancelConfirmState

    if (!contractId) return

    try {
      // Fetch contract items to return equipment to stock
      const { data: contractItems, error: fetchError } = await supabase
        .from("itens_contrato")
        .select("equipamento_id, quantidade")
        .eq("contrato_id", contractId)

      if (fetchError) throw fetchError

      // Return equipment to stock
      if (contractItems && contractItems.length > 0) {
        for (const item of contractItems) {
          const { error: stockError } = await supabase.rpc("increment_equipment_stock", {
            equipment_id: item.equipamento_id,
            quantity: item.quantidade,
          })

          if (stockError) {
            console.error("Error returning equipment to stock:", stockError)
            throw stockError
          }
        }
      }

      // Update contract status to "cancelado"
      const { error: updateError } = await supabase
        .from("contratos")
        .update({ status: "cancelado" })
        .eq("id", contractId)

      if (updateError) throw updateError

      // Update local state
      setContracts((prev) => prev.map((c) => (c.id === contractId ? { ...c, status: "cancelado" } : c)))

      // Close dialog
      setCancelConfirmState({ isOpen: false, contractId: null, contractNumber: "" })

      toast({
        title: "Contrato cancelado!",
        description: `Contrato ${contractNumber} cancelado com sucesso. Equipamentos devolvidos ao estoque.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error canceling contract:", error)
      setCancelConfirmState({ isOpen: false, contractId: null, contractNumber: "" })

      toast({
        title: "Erro ao cancelar contrato",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = async (contractId: string, contractNumber: string) => {
    try {
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde enquanto o relatório é gerado.",
      })

      const response = await fetch(`/api/contracts/${contractId}/pdf`)

      if (!response.ok) {
        throw new Error("Erro ao gerar PDF")
      }

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `contrato-${contractNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "PDF gerado!",
        description: `Relatório do contrato ${contractNumber} baixado com sucesso.`,
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando contratos...</div>
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-orange-500" />
                  Contratos
                </CardTitle>
                <CardDescription className="text-slate-400">Gerencie todos os contratos de locação</CardDescription>
              </div>
              <Button asChild className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                <Link href="/contratos/criar">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contrato
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 h-4 w-4" />
                <Input
                  placeholder="Buscar contratos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="hidden md:block rounded-md border border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-300">Número</TableHead>
                    <TableHead className="text-slate-300">Cliente</TableHead>
                    <TableHead className="text-slate-300">Período</TableHead>
                    <TableHead className="text-slate-300">Valor Total</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="w-[70px] text-slate-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length === 0 ? (
                    <TableRow className="border-slate-700">
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                        Nenhum contrato encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContracts.map((contract) => (
                      <TableRow key={contract.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="font-medium text-orange-400">{contract.numero_contrato}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{contract.clientes?.nome}</div>
                            {contract.clientes?.empresa && (
                              <div className="text-sm text-slate-400">{contract.clientes.empresa}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-white">{contract.data_inicio.split("-").reverse().join("/")}</div>
                            <div className="text-slate-400">até {contract.data_fim.split("-").reverse().join("/")}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-orange-500">
                          R$ {contract.valor_total?.toFixed(2) || "0,00"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(contract.status)}>{getStatusLabel(contract.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/contratos/${contract.id}`} className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/contratos/${contract.id}/editar`}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadPDF(contract.id, contract.numero_contrato)}
                                className="cursor-pointer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Baixar PDF
                              </DropdownMenuItem>
                              {contract.status !== "cancelado" && contract.status !== "finalizado" && (
                                <DropdownMenuItem
                                  onClick={() => handleCancelClick(contract.id, contract.numero_contrato)}
                                  className="text-yellow-400 focus:text-yellow-400 cursor-pointer"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(contract.id, contract.numero_contrato)}
                                className="text-red-400 focus:text-red-400 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden space-y-4">
              {filteredContracts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Nenhum contrato encontrado</div>
              ) : (
                filteredContracts.map((contract) => (
                  <Card key={contract.id} className="bg-slate-900 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-orange-400 text-lg mb-1">{contract.numero_contrato}</div>
                          <div className="font-medium text-white">{contract.clientes?.nome}</div>
                          {contract.clientes?.empresa && (
                            <div className="text-sm text-slate-400">{contract.clientes.empresa}</div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link href={`/contratos/${contract.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/contratos/${contract.id}/editar`}
                                className="flex items-center cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadPDF(contract.id, contract.numero_contrato)}
                              className="cursor-pointer"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Baixar PDF
                            </DropdownMenuItem>
                            {contract.status !== "cancelado" && contract.status !== "finalizado" && (
                              <DropdownMenuItem
                                onClick={() => handleCancelClick(contract.id, contract.numero_contrato)}
                                className="text-yellow-400 focus:text-yellow-400 cursor-pointer"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(contract.id, contract.numero_contrato)}
                              className="text-red-400 focus:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Período:</span>
                          <span className="text-white">
                            {contract.data_inicio.split("-").reverse().join("/")} até{" "}
                            {contract.data_fim.split("-").reverse().join("/")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Valor:</span>
                          <span className="font-medium text-orange-500">
                            R$ {contract.valor_total?.toFixed(2) || "0,00"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Status:</span>
                          <Badge className={getStatusColor(contract.status)}>{getStatusLabel(contract.status)}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={deleteConfirmState.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteConfirmState({ isOpen: false, contractId: null, contractNumber: "", itemCount: 0 })
        }
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl">Excluir Contrato</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base text-foreground/80">
              Tem certeza que deseja excluir o contrato{" "}
              <span className="font-semibold text-foreground">"{deleteConfirmState.contractNumber}"</span>?
              <br />
              <br />
              {deleteConfirmState.itemCount > 0 && (
                <>
                  Este contrato possui{" "}
                  <span className="font-semibold text-foreground">{deleteConfirmState.itemCount} equipamento(s)</span>{" "}
                  que serão devolvidos ao estoque.
                  <br />
                  <br />
                </>
              )}
              <span className="text-muted-foreground text-sm">Nota: Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir Contrato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={cancelConfirmState.isOpen}
        onOpenChange={(open) => !open && setCancelConfirmState({ isOpen: false, contractId: null, contractNumber: "" })}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                <XCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl">Cancelar Contrato</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base text-foreground/80">
              Tem certeza que deseja cancelar o contrato{" "}
              <span className="font-semibold text-foreground">"{cancelConfirmState.contractNumber}"</span>?
              <br />
              <br />O contrato será marcado como <span className="font-semibold text-foreground">cancelado</span> e os
              equipamentos serão devolvidos ao estoque.
              <br />
              <br />
              <span className="text-muted-foreground text-sm">
                Nota: O contrato não será excluído, apenas terá seu status alterado para "cancelado".
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-yellow-500 hover:bg-yellow-600">
              Cancelar Contrato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
