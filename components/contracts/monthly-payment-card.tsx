"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Clock, AlertCircle, Edit, Trash2, FileText } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { PaymentReceiptModal } from "./payment-receipt-modal"

interface MonthlyPaymentCardProps {
  id: string
  mesReferencia: string
  valor: number
  status: "pendente" | "pago" | "atrasado"
  dataVencimento: string
  dataPagamento?: string
  onMarkAsPaid: (id: string) => Promise<void>
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  contractNumber?: string
  clientName?: string
  clientCpf?: string
  clientPhone?: string
  contractStartDate?: string
  contractEndDate?: string
}

export function MonthlyPaymentCard({
  id,
  mesReferencia,
  valor,
  status,
  dataVencimento,
  dataPagamento,
  onMarkAsPaid,
  onEdit,
  onDelete,
  contractNumber = "",
  clientName = "",
  clientCpf,
  clientPhone,
  contractStartDate = "",
  contractEndDate = "",
}: MonthlyPaymentCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [showReceipt, setShowReceipt] = useState(false)

  const handleMarkAsPaid = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      console.log("[v0] Marking payment as paid:", id)
      await onMarkAsPaid(id)
      console.log("[v0] Payment marked as paid successfully")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error marking payment as paid:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Edit button clicked for payment:", id, mesReferencia)
    if (onEdit) {
      console.log("[v0] Calling onEdit function")
      onEdit(id)
    } else {
      console.log("[v0] onEdit function not provided")
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Delete button clicked for payment:", id, mesReferencia)
    if (onDelete) {
      console.log("[v0] Calling onDelete function")
      onDelete(id)
    } else {
      console.log("[v0] onDelete function not provided")
    }
  }

  const getStatusConfig = () => {
    switch (status) {
      case "pago":
        return {
          badge: "Pago",
          badgeClass: "bg-green-500/20 text-green-400 border-green-500/50",
          icon: Check,
          iconClass: "text-green-400",
          cardClass: "border-green-500/50 bg-green-500/5",
        }
      case "atrasado":
        return {
          badge: "Atrasado",
          badgeClass: "bg-red-500/20 text-red-400 border-red-500/50",
          icon: AlertCircle,
          iconClass: "text-red-400",
          cardClass: "border-red-500/50 bg-red-500/5",
        }
      default:
        return {
          badge: "Pendente",
          badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
          icon: Clock,
          iconClass: "text-yellow-400",
          cardClass: "border-yellow-500/50 bg-yellow-500/5",
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <>
      <Card className={`${config.cardClass} border-2 transition-all duration-200 hover:shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconComponent className={`h-5 w-5 ${config.iconClass}`} />
                <span className="font-semibold text-white capitalize">{mesReferencia}</span>
              </div>
              <Badge className={`${config.badgeClass} border`}>{config.badge}</Badge>
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-orange-400">
              R$ {valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>

            {/* Dates */}
            <div className="space-y-1 text-sm text-gray-400">
              <div>
                <span className="text-gray-500">Vencimento:</span>{" "}
                {new Date(dataVencimento + "T00:00:00").toLocaleDateString("pt-BR")}
              </div>
              {dataPagamento && (
                <div>
                  <span className="text-gray-500">Pago em:</span>{" "}
                  {new Date(dataPagamento + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {status !== "pago" && (
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como Pago
                    </>
                  )}
                </Button>
              )}

              {status === "pago" && (
                <Button
                  size="sm"
                  onClick={() => setShowReceipt(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Comprovante
                </Button>
              )}

              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                    className="bg-transparent border-gray-600 hover:bg-gray-700 flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}

                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    className="bg-transparent border-red-600 hover:bg-red-700 text-red-400 hover:text-red-300 flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PaymentReceiptModal
        open={showReceipt}
        onOpenChange={setShowReceipt}
        contractNumber={contractNumber}
        clientName={clientName}
        clientCpf={clientCpf}
        clientPhone={clientPhone}
        paymentMonth={mesReferencia}
        paymentValue={valor}
        paymentDate={dataPagamento || new Date().toISOString()}
        contractStartDate={contractStartDate}
        contractEndDate={contractEndDate}
      />
    </>
  )
}
