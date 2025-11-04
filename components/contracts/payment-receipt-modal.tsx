"use client"

import { useRef } from "react"
import { X, Printer, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentReceipt } from "./payment-receipt"

interface PaymentReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contractNumber: string
  clientName: string
  clientCpf?: string
  clientPhone?: string
  paymentMonth: string
  paymentValue: number
  paymentDate: string
  contractStartDate: string
  contractEndDate: string
  equipments?: Array<{
    nome: string
    quantidade: number
    valor_unitario: number
  }>
}

export function PaymentReceiptModal({ open, onOpenChange, equipments, ...receiptProps }: PaymentReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!receiptRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const receiptHtml = receiptRef.current.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprovante de Pagamento</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${receiptHtml}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDownload = async () => {
    if (!receiptRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const link = document.createElement("a")
      link.download = `comprovante-${receiptProps.contractNumber}-${receiptProps.paymentMonth}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("[v0] Error generating receipt image:", error)
      alert("Erro ao gerar imagem do comprovante. Tente usar a opção Imprimir.")
    }
  }

  const handleShare = async () => {
    if (!receiptRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], `comprovante-${receiptProps.contractNumber}-${receiptProps.paymentMonth}.png`, {
          type: "image/png",
        })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Comprovante de Pagamento",
            text: `Comprovante de pagamento - ${receiptProps.contractNumber}`,
          })
        } else {
          const link = document.createElement("a")
          link.download = file.name
          link.href = URL.createObjectURL(blob)
          link.click()
        }
      })
    } catch (error) {
      console.error("[v0] Error sharing receipt:", error)
      alert("Erro ao compartilhar comprovante. Tente usar a opção Baixar.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Comprovante de Pagamento</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <PaymentReceipt ref={receiptRef} {...receiptProps} equipments={equipments} />

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            <Button onClick={handleShare} className="flex-1 bg-orange-600 hover:bg-orange-700">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
