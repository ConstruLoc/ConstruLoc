"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, FileText, Search, Calendar } from "lucide-react"
import { ClientPaymentsModal } from "./client-payments-modal"

interface Cliente {
  id: string
  nome: string
  documento: string
  telefone: string
  email: string
  contratos: Array<{
    id: string
    numero_contrato: string
    data_inicio: string
    data_fim: string
    status: string
    valor_mensal: number
  }>
}

interface ClientReceiptsListProps {
  clientes: Cliente[]
}

export function ClientReceiptsList({ clientes }: ClientReceiptsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null)

  // Filtrar clientes por nome ou documento
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Buscar cliente por nome ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClientes.map((cliente) => {
          const contratosAtivos = cliente.contratos.filter((c) => c.status === "ativo").length
          const totalContratos = cliente.contratos.length

          return (
            <Card
              key={cliente.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-500"
              onClick={() => setSelectedClient(cliente)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{cliente.nome}</h3>
                    <p className="text-sm text-muted-foreground">{cliente.documento}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>
                    {totalContratos} contrato{totalContratos !== 1 ? "s" : ""}
                  </span>
                  {contratosAtivos > 0 && (
                    <span className="text-green-600 font-medium">
                      ({contratosAtivos} ativo{contratosAtivos !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Ver Comprovantes
              </Button>
            </Card>
          )
        })}
      </div>

      {filteredClientes.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum cliente encontrado com esse termo de busca.</p>
        </div>
      )}

      {/* Modal de Pagamentos do Cliente */}
      {selectedClient && (
        <ClientPaymentsModal cliente={selectedClient} open={!!selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </>
  )
}
