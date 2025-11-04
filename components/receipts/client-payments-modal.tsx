"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PaymentReceiptModal } from "@/components/contracts/payment-receipt-modal"
import { createBrowserClient } from "@/lib/supabase/client"

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

interface Pagamento {
  id: string
  mes_referencia: string
  valor: number
  status: string
  data_vencimento: string
  data_pagamento: string | null
  contrato_id: string
  contratos: {
    numero_contrato: string
    data_inicio: string
    data_fim: string
    itens_contrato: Array<{
      quantidade: number
      equipamentos: {
        nome: string
        marca: string
        modelo: string
      }
    }>
  }
}

interface ClientPaymentsModalProps {
  cliente: Cliente
  open: boolean
  onClose: () => void
}

export function ClientPaymentsModal({ cliente, open, onClose }: ClientPaymentsModalProps) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState<string>("todos")
  const [filterStatus, setFilterStatus] = useState<string>("todos")
  const [selectedPayment, setSelectedPayment] = useState<Pagamento | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (open) {
      fetchPagamentos()
    }
  }, [open])

  async function fetchPagamentos() {
    setLoading(true)
    try {
      // Buscar todos os pagamentos de todos os contratos do cliente
      const contratoIds = cliente.contratos.map((c) => c.id)

      const { data, error } = await supabase
        .from("pagamentos_mensais")
        .select(`
          *,
          contratos (
            numero_contrato,
            data_inicio,
            data_fim,
            itens_contrato (
              quantidade,
              equipamentos (
                nome,
                marca,
                modelo
              )
            )
          )
        `)
        .in("contrato_id", contratoIds)
        .order("mes_referencia", { ascending: false })

      if (error) throw error

      setPagamentos(data || [])
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar pagamentos
  const filteredPagamentos = pagamentos.filter((pag) => {
    const year = pag.mes_referencia.split("-")[0]
    const matchYear = filterYear === "todos" || year === filterYear
    const matchStatus = filterStatus === "todos" || pag.status === filterStatus
    return matchYear && matchStatus
  })

  // Obter anos únicos dos pagamentos
  const years = Array.from(new Set(pagamentos.map((p) => p.mes_referencia.split("-")[0]))).sort(
    (a, b) => Number(b) - Number(a),
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pago: { label: "Pago", className: "bg-green-500 text-white" },
      pendente: { label: "Pendente", className: "bg-yellow-500 text-white" },
      atrasado: { label: "Atrasado", className: "bg-red-500 text-white" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-500" />
              Comprovantes de {cliente.nome}
            </DialogTitle>
          </DialogHeader>

          {/* Filtros */}
          <div className="flex gap-4 mb-4">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os anos</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pago">Apenas Pagos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="atrasado">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Pagamentos */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredPagamentos.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPagamentos.map((pagamento) => {
                const mesReferencia = format(new Date(pagamento.mes_referencia + "-01"), "MMMM/yyyy", {
                  locale: ptBR,
                })

                return (
                  <Card key={pagamento.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-orange-500" />
                          <span className="font-semibold text-lg capitalize">{mesReferencia}</span>
                          {getStatusBadge(pagamento.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Contrato: {pagamento.contratos.numero_contrato}</p>
                          <p>Valor: R$ {pagamento.valor.toFixed(2)}</p>
                          {pagamento.data_pagamento && (
                            <p>Pago em: {format(new Date(pagamento.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedPayment(pagamento)}
                        disabled={pagamento.status !== "pago"}
                        className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Gerar Comprovante
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Comprovante */}
      {selectedPayment && (
        <PaymentReceiptModal
          open={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          clientName={cliente.nome}
          clientDocument={cliente.documento}
          clientPhone={cliente.telefone}
          clientEmail={cliente.email}
          contractNumber={selectedPayment.contratos.numero_contrato}
          monthReference={selectedPayment.mes_referencia}
          amount={selectedPayment.valor}
          paymentDate={selectedPayment.data_pagamento || new Date().toISOString()}
          contractStartDate={selectedPayment.contratos.data_inicio}
          contractEndDate={selectedPayment.contratos.data_fim}
          equipments={selectedPayment.contratos.itens_contrato.map((item) => ({
            name: item.equipamentos.nome,
            brand: item.equipamentos.marca || "Sem marca",
            model: item.equipamentos.modelo || "Sem modelo",
            quantity: item.quantidade,
          }))}
        />
      )}
    </>
  )
}
