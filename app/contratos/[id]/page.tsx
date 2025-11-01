import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft, User, Calendar, DollarSign, FileText, Mail, Phone, Hash } from "lucide-react"
import Link from "next/link"
import {
  markMonthAsPaid,
  updateMonthlyPaymentsStatus,
  generateMonthlyPayments,
  recalculateMonthlyPayments,
} from "@/lib/actions/monthly-payments"
import { ContractCreationForm } from "@/components/contracts/contract-creation-form"
import { MonthlyPaymentsSection } from "@/components/contracts/monthly-payments-section"

function isValidUUID(str: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "criar" || id === "novo") {
    return (
      <MainLayout title="Novo Contrato" showBackButton={true}>
        <ContractCreationForm />
      </MainLayout>
    )
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
      )
    `)
    .eq("id", id)
    .single()

  if (error || !contract) {
    notFound()
  }

  const { data: monthlyPayments } = await supabase
    .from("pagamentos_mensais")
    .select("*")
    .eq("contrato_id", id)
    .order("ano", { ascending: true })
    .order("mes", { ascending: true })

  // Gerar pagamentos mensais se não existirem
  if (!monthlyPayments || monthlyPayments.length === 0) {
    await generateMonthlyPayments(id, contract.data_inicio, contract.data_fim, contract.valor_total)
  }

  // Atualizar status dos pagamentos
  await updateMonthlyPaymentsStatus(id)

  // Buscar pagamentos atualizados
  const { data: updatedMonthlyPayments } = await supabase
    .from("pagamentos_mensais")
    .select("*")
    .eq("contrato_id", id)
    .order("ano", { ascending: true })
    .order("mes", { ascending: true })

  // Server action para marcar pagamento como pago
  async function handleMarkAsPaid(paymentId: string) {
    "use server"
    return await markMonthAsPaid(paymentId)
  }

  async function handleRecalculatePayments() {
    "use server"
    return await recalculateMonthlyPayments(id)
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

          {updatedMonthlyPayments && updatedMonthlyPayments.length > 0 && (
            <MonthlyPaymentsSection
              payments={updatedMonthlyPayments}
              onMarkAsPaid={handleMarkAsPaid}
              onRecalculate={handleRecalculatePayments}
              contractId={id}
            />
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
