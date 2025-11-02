"use client"

import { forwardRef } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CheckCircle2 } from "lucide-react"

interface PaymentReceiptProps {
  contractNumber: string
  clientName: string
  clientCpf?: string
  clientPhone?: string
  paymentMonth: string
  paymentValue: number
  paymentDate: string
  contractStartDate: string
  contractEndDate: string
}

export const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(
  (
    {
      contractNumber,
      clientName,
      clientCpf,
      clientPhone,
      paymentMonth,
      paymentValue,
      paymentDate,
      contractStartDate,
      contractEndDate,
    },
    ref,
  ) => {
    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(paymentValue)

    const formattedPaymentDate = format(new Date(paymentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900 p-8 max-w-2xl mx-auto"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-orange-500 pb-6">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">ConstruLoc</h1>
          <p className="text-sm text-gray-600">Locação de Equipamentos para Construção</p>
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Comprovante de Pagamento</h2>
          <p className="text-sm text-gray-600">Pagamento recebido com sucesso</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Número do Contrato</p>
              <p className="text-lg font-bold text-gray-800">{contractNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Referente ao Mês</p>
              <p className="text-lg font-bold text-gray-800">{paymentMonth}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 uppercase mb-1">Valor Pago</p>
            <p className="text-3xl font-bold text-green-600">{formattedValue}</p>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-2">
            Dados do Cliente
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nome:</span>
              <span className="text-sm font-medium text-gray-800">{clientName}</span>
            </div>
            {clientCpf && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPF:</span>
                <span className="text-sm font-medium text-gray-800">{clientCpf}</span>
              </div>
            )}
            {clientPhone && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Telefone:</span>
                <span className="text-sm font-medium text-gray-800">{clientPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contract Period */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-2">
            Período do Contrato
          </h3>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">
              {format(new Date(contractStartDate), "dd/MM/yyyy")} até {format(new Date(contractEndDate), "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        {/* Payment Date */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Data do Pagamento</p>
          <p className="text-sm font-medium text-gray-800">{formattedPaymentDate}</p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">Este é um comprovante eletrônico de pagamento</p>
          <p className="text-xs text-gray-500 mt-1">Emitido em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>
      </div>
    )
  },
)

PaymentReceipt.displayName = "PaymentReceipt"
