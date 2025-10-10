"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, Building, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  nome: string
  email: string
  telefone: string
  documento: string
  tipo_documento: string
  empresa: string
  cidade: string
  estado: string
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean
    clientId: string | null
    clientName: string
  }>({
    isOpen: false,
    clientId: null,
    clientName: "",
  })
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, typeFilter])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openMenuId])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from("clientes").select("*").order("nome")

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = clients

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.documento.includes(searchTerm) ||
          client.empresa?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((client) => client.tipo_documento === typeFilter)
    }

    setFilteredClients(filtered)
  }

  const formatDocument = (document: string, type: string) => {
    if (!document) return "-"

    if (type === "CPF") {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
  }

  const formatPhone = (phone: string) => {
    if (!phone) return "-"
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
  }

  const handleDeleteClick = (id: string, name: string) => {
    setOpenMenuId(null)
    setDeleteConfirmState({
      isOpen: true,
      clientId: id,
      clientName: name,
    })
  }

  const handleDelete = async () => {
    const { clientId, clientName } = deleteConfirmState

    if (!clientId) return

    try {
      const { data: contracts, error: contractsError } = await supabase
        .from("contratos")
        .select("id")
        .eq("cliente_id", clientId)

      if (contractsError) throw contractsError

      if (contracts && contracts.length > 0) {
        setDeleteConfirmState({ isOpen: false, clientId: null, clientName: "" })
        toast({
          title: "Não é possível excluir",
          description: `O cliente ${clientName} possui ${contracts.length} contrato(s) associado(s). Exclua os contratos primeiro.`,
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("clientes").delete().eq("id", clientId)

      if (error) throw error

      setClients((prev) => prev.filter((c) => c.id !== clientId))
      setDeleteConfirmState({ isOpen: false, clientId: null, clientName: "" })

      toast({
        title: "Cliente excluído!",
        description: `Cliente ${clientName} excluído com sucesso.`,
      })
    } catch (error) {
      console.error("Error deleting client:", error)
      setDeleteConfirmState({ isOpen: false, clientId: null, clientName: "" })

      toast({
        title: "Erro ao excluir cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando clientes...</div>
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-orange-500" />
              Clientes
            </h1>
            <p className="text-muted-foreground">Gerencie todos os clientes do sistema</p>
          </div>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
            <Link href="/clientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-md py-2 px-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos os tipos</option>
                <option value="CPF">Pessoa Física (CPF)</option>
                <option value="CNPJ">Pessoa Jurídica (CNPJ)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="hidden md:block rounded-md border border-gray-800 bg-gray-900 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-4 py-2">Nome</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Documento</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Telefone</th>
                <th className="text-left px-4 py-2">Localização</th>
                <th className="text-left px-4 py-2 w-[70px]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{client.nome}</div>
                        {client.empresa && <div className="text-sm text-orange-400">({client.empresa})</div>}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1 w-fit border-orange-500/30">
                        {client.tipo_documento === "CPF" ? (
                          <User className="h-3 w-3 text-orange-400" />
                        ) : (
                          <Building className="h-3 w-3 text-orange-400" />
                        )}
                        {client.tipo_documento}
                      </div>
                    </td>
                    <td className="font-mono text-sm px-4 py-2">
                      {formatDocument(client.documento, client.tipo_documento)}
                    </td>
                    <td className="px-4 py-2">{client.email}</td>
                    <td className="px-4 py-2">{formatPhone(client.telefone)}</td>
                    <td className="px-4 py-2">
                      {client.cidade && client.estado ? `${client.cidade}, ${client.estado}` : "-"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="relative" ref={openMenuId === client.id ? menuRef : null}>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === client.id ? null : client.id)
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {openMenuId === client.id && (
                          <div
                            className="absolute right-0 mt-2 w-48 rounded-md border border-gray-700 bg-gray-800 shadow-lg z-[10000]"
                            style={{ zIndex: 10000 }}
                          >
                            <div className="py-1">
                              <Link
                                href={`/clientes/${client.id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </Link>
                              <Link
                                href={`/clientes/${client.id}/editar`}
                                className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                              <button
                                onClick={() => handleDeleteClick(client.id, client.nome)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum cliente encontrado</div>
          ) : (
            filteredClients.map((client) => (
              <Card key={client.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-lg mb-1">{client.nome}</div>
                      {client.empresa && <div className="text-sm text-orange-400">{client.empresa}</div>}
                      <div className="flex items-center gap-1 w-fit border-orange-500/30 mt-2">
                        {client.tipo_documento === "CPF" ? (
                          <User className="h-3 w-3 text-orange-400" />
                        ) : (
                          <Building className="h-3 w-3 text-orange-400" />
                        )}
                        {client.tipo_documento}
                      </div>
                    </div>
                    <div className="relative" ref={openMenuId === client.id ? menuRef : null}>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === client.id ? null : client.id)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenuId === client.id && (
                        <div
                          className="absolute right-0 mt-2 w-48 rounded-md border border-gray-700 bg-gray-800 shadow-lg z-[10000]"
                          style={{ zIndex: 10000 }}
                        >
                          <div className="py-1">
                            <Link
                              href={`/clientes/${client.id}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                            <Link
                              href={`/clientes/${client.id}/editar`}
                              className="flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(client.id, client.nome)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Documento:</span>
                      <span className="font-mono">{formatDocument(client.documento, client.tipo_documento)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="truncate ml-2">{client.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Telefone:</span>
                      <span>{formatPhone(client.telefone)}</span>
                    </div>
                    {client.cidade && client.estado && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Localização:</span>
                        <span>
                          {client.cidade}, {client.estado}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog
        open={deleteConfirmState.isOpen}
        onOpenChange={(open) => !open && setDeleteConfirmState({ isOpen: false, clientId: null, clientName: "" })}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl">Excluir Cliente</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base text-foreground/80">
              Tem certeza que deseja excluir o cliente{" "}
              <span className="font-semibold text-foreground">"{deleteConfirmState.clientName}"</span>?
              <br />
              <br />
              <span className="font-semibold text-red-500">Esta ação não pode ser desfeita.</span>
              <br />
              <br />
              <span className="text-muted-foreground text-sm">
                Nota: Clientes com contratos associados não podem ser excluídos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir Cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
