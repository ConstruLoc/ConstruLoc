"use client"

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

interface DeletePaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  paymentMonth: string
  isDeleting: boolean
}

export function DeletePaymentModal({
  open,
  onOpenChange,
  onConfirm,
  paymentMonth,
  isDeleting,
}: DeletePaymentModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-800 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl">Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300 text-base">
            Tem certeza que deseja excluir o pagamento de{" "}
            <span className="font-semibold text-orange-400">{paymentMonth}</span>?
            <br />
            <br />
            Esta ação não pode ser desfeita e o pagamento será removido permanentemente do sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Excluindo..." : "Excluir Pagamento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
