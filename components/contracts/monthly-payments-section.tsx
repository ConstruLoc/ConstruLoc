"use client"

import { MonthlyPaymentCard } from "@/components/contracts/monthly-payment-card"
import { EditMonthlyPaymentModal } from "@/components/contracts/edit-monthly-payment-modal"
import { DeletePaymentModal } from "@/components/contracts/delete-payment-modal"
import { deleteMonthlyPayment } from "@/lib/actions/monthly-payments"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface MonthlyPaymentsSectionProps {
  payments: any[]
  onMarkAsPaid: (paymentId: string) => Promise<any>
  onRecalculate?: () => Promise<{ success: boolean; error?: string; newValorTotal?: number }>
  contractId?: string
}

export function MonthlyPaymentsSection({
  payments,
  onMarkAsPaid,
  onRecalculate,
  contractId,
}: MonthlyPaymentsSectionProps) {
  const router = useRouter()
  const [editingPayment, setEditingPayment] = useState<any | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      console.log("[v0] MonthlyPaymentsSection: Marking payment as paid:", paymentId)
      const result = await onMarkAsPaid(paymentId)
      console.log("[v0] MonthlyPaymentsSection: Payment marked as paid, result:", result)

      if (result.success) {
        toast.success("Pagamento marcado como pago!")
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao marcar pagamento como pago")
      }

      return result
    } catch (error) {
      console.error("[v0] MonthlyPaymentsSection: Error marking payment as paid:", error)
      toast.error("Erro ao marcar pagamento como pago")
      throw error
    }
  }

  const handleEdit = (paymentId: string) => {
    console.log("[v0] MonthlyPaymentsSection: handleEdit called with paymentId:", paymentId)
    const payment = payments.find((p) => p.id === paymentId)
    console.log("[v0] MonthlyPaymentsSection: Found payment:", payment)
    if (payment) {
      setEditingPayment(payment)
      console.log("[v0] MonthlyPaymentsSection: Set editingPayment to:", payment)
    } else {
      console.log("[v0] MonthlyPaymentsSection: Payment not found!")
    }
  }

  const handleDelete = (paymentId: string) => {
    console.log("[v0] MonthlyPaymentsSection: handleDelete called with paymentId:", paymentId)
    const payment = payments.find((p) => p.id === paymentId)
    console.log("[v0] MonthlyPaymentsSection: Found payment:", payment)
    if (payment) {
      setDeletingPayment(payment)
      console.log("[v0] MonthlyPaymentsSection: Set deletingPayment to:", payment)
    } else {
      console.log("[v0] MonthlyPaymentsSection: Payment not found!")
    }
  }

  const confirmDelete = async () => {
    if (!deletingPayment) return

    setIsDeleting(true)
    try {
      const result = await deleteMonthlyPayment(deletingPayment.id)

      if (result.success) {
        toast.success("Pagamento excluído com sucesso!")
        setDeletingPayment(null)
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao excluir pagamento")
      }
    } catch (error) {
      console.error("Error deleting payment:", error)
      toast.error("Erro ao excluir pagamento")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRecalculate = async () => {
    if (!onRecalculate) return

    setIsRecalculating(true)
    try {
      const result = await onRecalculate()
      if (result.success) {
        toast.success("Pagamentos recalculados com sucesso!")
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao recalcular pagamentos")
      }
    } catch (error) {
      console.error("[v0] Error recalculating payments:", error)
      toast.error("Erro ao recalcular pagamentos")
    } finally {
      setIsRecalculating(false)
    }
  }

  return (
    <>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-orange-500 rounded" />
            <h2 className="text-lg font-semibold text-white">Pagamentos Mensais</h2>
          </div>
          {onRecalculate && (
            <Button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRecalculating ? "animate-spin" : ""}`} />
              {isRecalculating ? "Recalculando..." : "Recalcular Valores"}
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {payments.map((payment: any) => (
            <MonthlyPaymentCard
              key={payment.id}
              id={payment.id}
              mesReferencia={payment.mes_referencia}
              valor={Number(payment.valor)}
              status={payment.status}
              dataVencimento={payment.data_vencimento}
              dataPagamento={payment.data_pagamento}
              onMarkAsPaid={handleMarkAsPaid}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Resumo dos pagamentos */}
        <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total de Meses</p>
              <p className="text-2xl font-bold text-white">{payments.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Meses Pagos</p>
              <p className="text-2xl font-bold text-green-400">
                {payments.filter((p: any) => p.status === "pago").length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Meses Atrasados</p>
              <p className="text-2xl font-bold text-red-400">
                {payments.filter((p: any) => p.status === "atrasado").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      {editingPayment && (
        <>
          {console.log("[v0] MonthlyPaymentsSection: Rendering EditMonthlyPaymentModal for:", editingPayment)}
          <EditMonthlyPaymentModal
            payment={editingPayment}
            open={!!editingPayment}
            onOpenChange={(open) => {
              console.log("[v0] MonthlyPaymentsSection: EditModal onOpenChange called with:", open)
              if (!open) setEditingPayment(null)
            }}
          />
        </>
      )}

      {deletingPayment && (
        <>
          {console.log("[v0] MonthlyPaymentsSection: Rendering DeletePaymentModal for:", deletingPayment)}
          <DeletePaymentModal
            open={!!deletingPayment}
            onOpenChange={(open) => {
              console.log("[v0] MonthlyPaymentsSection: DeleteModal onOpenChange called with:", open)
              if (!open) setDeletingPayment(null)
            }}
            onConfirm={confirmDelete}
            paymentMonth={deletingPayment.mes_referencia}
            isDeleting={isDeleting}
          />
        </>
      )}
    </>
  )
}
