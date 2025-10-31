"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateMonthlyPayment } from "@/lib/actions/monthly-payments"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface EditMonthlyPaymentModalProps {
  payment: {
    id: string
    mes_referencia: string
    valor: number
    data_vencimento: string
    data_pagamento?: string
    status: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMonthlyPaymentModal({ payment, open, onOpenChange }: EditMonthlyPaymentModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    valor: payment.valor.toString(),
    data_vencimento: payment.data_vencimento,
    data_pagamento: payment.data_pagamento || "",
    status: payment.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateMonthlyPayment(payment.id, {
        valor: Number.parseFloat(formData.valor),
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.data_pagamento || null,
        status: formData.status,
      })

      if (result.success) {
        toast.success("Pagamento atualizado com sucesso!")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao atualizar pagamento")
      }
    } catch (error) {
      console.error("Error updating payment:", error)
      toast.error("Erro ao atualizar pagamento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Editar Pagamento - {payment.mes_referencia}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor" className="text-slate-300">
              Valor (R$)
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
              required
            />
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label htmlFor="data_vencimento" className="text-slate-300">
              Data de Vencimento
            </Label>
            <Input
              id="data_vencimento"
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
              required
            />
          </div>

          {/* Data de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="data_pagamento" className="text-slate-300">
              Data de Pagamento (opcional)
            </Label>
            <Input
              id="data_pagamento"
              type="date"
              value={formData.data_pagamento}
              onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-slate-300">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="pendente" className="text-white hover:bg-slate-700">
                  Pendente
                </SelectItem>
                <SelectItem value="pago" className="text-white hover:bg-slate-700">
                  Pago
                </SelectItem>
                <SelectItem value="atrasado" className="text-white hover:bg-slate-700">
                  Atrasado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
