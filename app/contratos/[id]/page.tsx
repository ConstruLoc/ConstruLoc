import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Edit,
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  Phone,
  Hash,
  CreditCard,
  CheckCircle2,
  Clock,
} from "lucide-react"
import Link from "next/link"

function isValidUUID(str: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!isValidUUID(id)) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch contract details with related data
  const { data: contract, error } = await supabase
    .from("contratos")
    .select(`
      *,
      clientes (
        nome,
        email,
        telefone,
        empresa,
        documento,
        tipo_documento
      ),
      itens_contrato (
        *,
        equipamentos (
          nome,
          marca,
          modelo
        )
      ),
      pagamentos (
        id,
        status,
        data_pagamento,
        valor
      )
    `)
    .eq("id", id)
    .single()

  if (error || !contract) {
    console.log("[v0] Contract not found error:", error)
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800"
      case "pendente":
        return "bg-yellow-100 text-yellow-800"
      case "finalizado":
        return "bg-gray-100 text-gray-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
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

  const calculateDays = () => {
    const start = new Date(contract.data_inicio)
    const end = new Date(contract.data_fim)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const calculatePendingMonths = (dataInicio: string, dataFim: string, statusPagamento: string) => {
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

  const isPaymentOverdue = (dataFim: string, statusPagamento: string) => {
    if (statusPagamento !== "pendente") {
      return false
    }
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const fim = new Date(dataFim)
    fim.setHours(0, 0, 0, 0)
    return fim < hoje
  }

  const getPaymentStatusColor = (status: string) => {
    if (status === "pendente" && isPaymentOverdue(contract.data_fim, status)) {
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

  const getPaymentStatusLabel = (status: string) => {
    if (status === "pendente" && isPaymentOverdue(contract.data_fim, status)) {
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

  const pendingMonths =
    contract.pagamentos && contract.pagamentos.length > 0
      ? calculatePendingMonths(contract.data_inicio, contract.data_fim, contract.pagamentos[0].status)
      : null

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header com botões */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="text-slate-300 hover:text-white hover:bg-slate-800">
              <Link href="/contratos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href={`/contratos/${contract.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>

          {/* Card principal com informações do contrato */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            {/* Cabeçalho do contrato */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-6 w-6 text-orange-500" />
                  <h1 className="text-2xl font-bold text-white">{contract.numero_contrato}</h1>
                </div>
                <p className="text-slate-400">Contrato de Locação</p>
              </div>
              <Badge className={getStatusColor(contract.status)}>{getStatusLabel(contract.status)}</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Informações do Contrato */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-orange-500 rounded" />
                  <h2 className="text-lg font-semibold text-white">Informações do Contrato</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Data de Início</p>
                      <p className="text-white">{new Date(contract.data_inicio).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Data de Fim</p>
                      <p className="text-white">{new Date(contract.data_fim).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Período</p>
                      <p className="text-white">{calculateDays()} dias</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Valor Total</p>
                      <p className="text-2xl font-bold text-orange-500">
                        R$ {contract.valor_total?.toFixed(2).replace(".", ",") || "0,00"}
                      </p>
                    </div>
                  </div>

                  {contract.observacoes && (
                    <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Observações</p>
                      <p className="text-sm text-slate-300">{contract.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações do Cliente */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-orange-500 rounded" />
                  <h2 className="text-lg font-semibold text-white">Informações do Cliente</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Nome</p>
                      <p className="text-white font-medium">{contract.clientes.nome}</p>
                      {contract.clientes.empresa && (
                        <p className="text-sm text-slate-400 mt-1">{contract.clientes.empresa}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-white">{contract.clientes.email || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Telefone</p>
                      <p className="text-white">{formatPhone(contract.clientes.telefone)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        {contract.clientes.tipo_documento}
                      </p>
                      <p className="text-white font-mono">
                        {formatDocument(contract.clientes.documento, contract.clientes.tipo_documento)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {contract.pagamentos && contract.pagamentos.length > 0 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1 w-12 bg-orange-500 rounded" />
                <h2 className="text-lg font-semibold text-white">Informações de Pagamento</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Status do Pagamento</p>
                    <Badge className={getPaymentStatusColor(contract.pagamentos[0].status)}>
                      {getPaymentStatusLabel(contract.pagamentos[0].status)}
                    </Badge>
                    {pendingMonths && (
                      <div className="mt-2">
                        <p className="text-sm text-red-400 font-medium">{pendingMonths.mensagem}</p>
                        <div className="mt-1 text-xs text-slate-400">
                          {pendingMonths.meses.map((m) => m.mesAno).join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {contract.pagamentos[0].data_pagamento && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Data de Pagamento</p>
                      <p className="text-white">
                        {new Date(contract.pagamentos[0].data_pagamento).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Valor do Pagamento</p>
                    <p className="text-xl font-bold text-orange-500">
                      R${" "}
                      {contract.pagamentos[0].valor?.toFixed(2).replace(".", ",") ||
                        contract.valor_total?.toFixed(2).replace(".", ",") ||
                        "0,00"}
                    </p>
                  </div>
                </div>

                {contract.pagamentos[0].status === "pendente" && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Situação</p>
                      <p className="text-yellow-400">Aguardando pagamento</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipamentos Locados */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-orange-500 rounded" />
              <h2 className="text-lg font-semibold text-white">
                Equipamentos Locados ({contract.itens_contrato?.length || 0})
              </h2>
            </div>

            {contract.itens_contrato && contract.itens_contrato.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Equipamento
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Marca/Modelo
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Quantidade
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Valor Unitário
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.itens_contrato.map((item: any) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-4 px-4 text-white font-medium">{item.equipamentos?.nome || "-"}</td>
                          <td className="py-4 px-4 text-slate-300">
                            {item.equipamentos?.marca && item.equipamentos?.modelo
                              ? `${item.equipamentos.marca} ${item.equipamentos.modelo}`
                              : item.equipamentos?.marca || item.equipamentos?.modelo || "-"}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-300">{item.quantidade}</td>
                          <td className="py-4 px-4 text-right text-slate-300">
                            R$ {item.valor_unitario?.toFixed(2).replace(".", ",") || "0,00"}
                          </td>
                          <td className="py-4 px-4 text-right text-white font-medium">
                            R$ {item.valor_total?.toFixed(2).replace(".", ",") || "0,00"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg">
                    <p className="text-lg font-bold text-orange-500">
                      Total: R$ {contract.valor_total?.toFixed(2).replace(".", ",") || "0,00"}
                    </p>
                    <p className="text-sm text-orange-400">
                      {calculateDays()} dias × R${" "}
                      {(contract.valor_total / calculateDays()).toFixed(2).replace(".", ",")}/dia
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Nenhum equipamento cadastrado neste contrato</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
