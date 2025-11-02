"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Download, Search, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface PaymentReceivable {
  id: string
  mes_referencia: string
  valor: number
  data_vencimento: string
  status: string
  contrato: {
    numero_contrato: string
    endereco_instalacao: string
    cliente: {
      nome: string
      documento: string
      telefone: string
    }
    itens_contrato: Array<{
      quantidade: number
      equipamento: {
        nome: string
        modelo: string | null
        marca: string | null
      }
    }>
  }
}

export function ReceivablesReport() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [receivables, setReceivables] = useState<PaymentReceivable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchReceivables = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Datas obrigatórias",
        description: "Por favor, selecione a data inicial e final do período.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const { data, error } = await supabase
        .from("pagamentos_mensais")
        .select(
          `
          id,
          mes_referencia,
          valor,
          data_vencimento,
          status,
          contrato:contratos (
            numero_contrato,
            endereco_instalacao,
            cliente:clientes (
              nome,
              documento,
              telefone
            ),
            itens_contrato (
              quantidade,
              equipamento:equipamentos (
                nome,
                modelo,
                marca
              )
            )
          )
        `,
        )
        .gte("data_vencimento", startDate)
        .lte("data_vencimento", endDate)
        .order("data_vencimento", { ascending: true })

      if (error) throw error

      console.log("[v0] Receivables fetched successfully:", data?.length || 0, "payments")
      setReceivables(data || [])

      toast({
        title: "Relatório gerado",
        description: `Encontrados ${data?.length || 0} pagamentos no período.`,
        className: "bg-green-600 text-white border-green-700",
      })
    } catch (error) {
      console.error("[v0] Error fetching receivables:", error)
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generatePDF = () => {
    if (receivables.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Faça uma busca primeiro para gerar o relatório.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Preparando impressão...",
      description: "Abrindo diálogo de impressão. Selecione 'Salvar como PDF' para exportar.",
      className: "bg-blue-600 text-white border-blue-700",
    })

    setTimeout(() => {
      window.print()
    }, 500)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const totalReceivable = receivables.reduce((sum, r) => sum + r.valor, 0)

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pendente: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      pago: { label: "Pago", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      atrasado: { label: "Atrasado", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    }

    const statusInfo = statusMap[status] || statusMap.pendente

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    )
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          nav,
          aside,
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .print-table {
            page-break-inside: avoid;
          }

          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }

          @page {
            margin: 2cm;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Filtros */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 no-print">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-white">Filtrar por Período</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-slate-300">
                  Data Inicial
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-slate-300">
                  Data Final
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={fetchReceivables}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? "Buscando..." : "Buscar"}
                </Button>

                {hasSearched && receivables.length > 0 && (
                  <Button
                    onClick={generatePDF}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Cabeçalho para impressão */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Relatório de Recebimentos</h1>
          <p className="text-gray-600 mt-2">
            Período: {startDate ? formatDate(startDate) : ""} até {endDate ? formatDate(endDate) : ""}
          </p>
          <p className="text-gray-600">
            Gerado em:{" "}
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Resultados */}
        {hasSearched && (
          <>
            {receivables.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Nenhum pagamento encontrado</h3>
                  <p className="text-slate-400">Não há pagamentos a receber no período selecionado.</p>
                </div>
              </Card>
            ) : (
              <>
                {/* Resumo */}
                <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30 p-6 print:bg-white print:border print:border-gray-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-sm print:text-gray-600">Total de Pagamentos</p>
                      <p className="text-2xl font-bold text-white print:text-gray-900">{receivables.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm print:text-gray-600">Total a Receber</p>
                      <p className="text-3xl font-bold text-orange-500 print:text-gray-900">
                        {formatCurrency(totalReceivable)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Lista de pagamentos */}
                <div className="space-y-4">
                  {receivables.map((receivable) => (
                    <Card
                      key={receivable.id}
                      className="bg-slate-800/50 border-slate-700 p-6 print-table print:bg-white print:border print:border-gray-300"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold text-white print:text-gray-900">
                              {receivable.contrato.cliente.nome}
                            </h4>
                            <p className="text-sm text-slate-400 print:text-gray-600">
                              CPF: {receivable.contrato.cliente.documento}
                            </p>
                            <p className="text-sm text-slate-400 print:text-gray-600">
                              Telefone: {receivable.contrato.cliente.telefone}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-500 print:text-gray-900">
                              {formatCurrency(receivable.valor)}
                            </p>
                            <p className="text-sm text-slate-400 print:text-gray-600 mt-1">
                              Vencimento: {formatDate(receivable.data_vencimento)}
                            </p>
                            <div className="mt-2 no-print">{getStatusBadge(receivable.status)}</div>
                            <p className="hidden print:block text-sm text-gray-600 mt-1">
                              Status: {receivable.status.charAt(0).toUpperCase() + receivable.status.slice(1)}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-700 print:border-gray-300 pt-4">
                          <p className="text-sm text-slate-400 print:text-gray-600 mb-2">
                            <span className="font-medium">Contrato:</span> {receivable.contrato.numero_contrato}
                          </p>
                          <p className="text-sm text-slate-400 print:text-gray-600 mb-2">
                            <span className="font-medium">Mês de Referência:</span> {receivable.mes_referencia}
                          </p>
                          <p className="text-sm text-slate-400 print:text-gray-600 mb-2">
                            <span className="font-medium">Endereço:</span> {receivable.contrato.endereco_instalacao}
                          </p>
                          <div>
                            <p className="text-sm font-medium text-slate-300 print:text-gray-700 mb-1">Equipamentos:</p>
                            <div className="flex flex-wrap gap-2">
                              {receivable.contrato.itens_contrato.map((item, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600 print:bg-gray-100 print:text-gray-700 print:border-gray-300"
                                >
                                  {item.quantidade}x {item.equipamento.nome}
                                  {item.equipamento.modelo && ` - ${item.equipamento.modelo}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
