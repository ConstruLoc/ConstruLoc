"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, Building, User } from "lucide-react"
import Link from "next/link"

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
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, typeFilter])

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

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        const { error } = await supabase.from("clientes").delete().eq("id", id)
        if (error) throw error
        fetchClients()
      } catch (error) {
        console.error("Error deleting client:", error)
        alert("Erro ao excluir cliente. Verifique se não há contratos associados.")
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando clientes...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
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

      {/* Filters */}
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="CPF">Pessoa Física (CPF)</SelectItem>
            <SelectItem value="CNPJ">Pessoa Jurídica (CNPJ)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block rounded-md border border-gray-800 bg-gray-900 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{client.nome}</div>
                      {client.empresa && <div className="text-sm text-orange-400">({client.empresa})</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit border-orange-500/30">
                      {client.tipo_documento === "CPF" ? (
                        <User className="h-3 w-3 text-orange-400" />
                      ) : (
                        <Building className="h-3 w-3 text-orange-400" />
                      )}
                      {client.tipo_documento}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatDocument(client.documento, client.tipo_documento)}
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{formatPhone(client.telefone)}</TableCell>
                  <TableCell>{client.cidade && client.estado ? `${client.cidade}, ${client.estado}` : "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/clientes/${client.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/clientes/${client.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-red-600">
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
                    <Badge variant="outline" className="flex items-center gap-1 w-fit border-orange-500/30 mt-2">
                      {client.tipo_documento === "CPF" ? (
                        <User className="h-3 w-3 text-orange-400" />
                      ) : (
                        <Building className="h-3 w-3 text-orange-400" />
                      )}
                      {client.tipo_documento}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/clientes/${client.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/clientes/${client.id}/editar`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
  )
}
