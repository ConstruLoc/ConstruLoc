"use client"

import { forwardRef } from "react"
import { format, isValid, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

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
  equipments?: Array<{
    nome: string
    quantidade: number
    valor_unitario: number
  }>
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
      equipments = [],
    },
    ref,
  ) => {
    const parseDate = (dateString: string) => {
      if (!dateString) return new Date()

      try {
        let date = parseISO(dateString)
        if (isValid(date)) return date

        date = new Date(dateString)
        if (isValid(date)) return date

        return new Date()
      } catch (error) {
        return new Date()
      }
    }

    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(paymentValue || 0)

    const paymentDateObj = parseDate(paymentDate)
    const startDateObj = parseDate(contractStartDate)
    const endDateObj = parseDate(contractEndDate)

    const formattedPaymentDate = format(paymentDateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    const formattedStartDate = format(startDateObj, "dd/MM/yyyy")
    const formattedEndDate = format(endDateObj, "dd/MM/yyyy")
    const formattedNow = format(new Date(), "dd/MM/yyyy 'às' HH:mm")

    return (
      <div
        ref={ref}
        className="receipt-container"
        style={{
          backgroundColor: "#ffffff",
          color: "#111827",
          padding: "32px",
          maxWidth: "672px",
          margin: "0 auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
            borderBottom: "2px solid #f97316",
            paddingBottom: "24px",
          }}
        >
          <h1
            style={{ fontSize: "30px", fontWeight: "bold", color: "#f97316", marginBottom: "8px", margin: "0 0 8px 0" }}
          >
            ConstruLoc
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Locação de Equipamentos para Construção</p>
        </div>

        {/* Receipt Title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              backgroundColor: "#dcfce7",
              borderRadius: "50%",
              marginBottom: "16px",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2
            style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px", margin: "0 0 8px 0" }}
          >
            Comprovante de Pagamento
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Pagamento recebido com sucesso</p>
        </div>

        {/* Payment Details */}
        <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                  margin: "0 0 4px 0",
                }}
              >
                Número do Contrato
              </p>
              <p style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", margin: "0" }}>
                {contractNumber || "N/A"}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                  margin: "0 0 4px 0",
                }}
              >
                Referente ao Mês
              </p>
              <p style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", margin: "0" }}>
                {paymentMonth || "N/A"}
              </p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                textTransform: "uppercase",
                marginBottom: "4px",
                margin: "0 0 4px 0",
              }}
            >
              Valor Pago
            </p>
            <p style={{ fontSize: "30px", fontWeight: "bold", color: "#16a34a", margin: "0" }}>{formattedValue}</p>
          </div>
        </div>

        {/* Client Information */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              textTransform: "uppercase",
              marginBottom: "12px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "8px",
              margin: "0 0 12px 0",
            }}
          >
            Dados do Cliente
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>Nome:</span>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{clientName || "N/A"}</span>
            </div>
            {clientCpf && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>CPF:</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{clientCpf}</span>
              </div>
            )}
            {clientPhone && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>Telefone:</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{clientPhone}</span>
              </div>
            )}
          </div>
        </div>

        {equipments && equipments.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                textTransform: "uppercase",
                marginBottom: "12px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "8px",
                margin: "0 0 12px 0",
              }}
            >
              Equipamentos Alugados
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {equipments.map((equipment, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{equipment.nome}</span>
                    <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "8px" }}>
                      (Qtd: {equipment.quantidade})
                    </span>
                  </div>
                  <span style={{ fontSize: "14px", color: "#6b7280" }}>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(equipment.valor_unitario * equipment.quantidade)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contract Period */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              textTransform: "uppercase",
              marginBottom: "12px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "8px",
              margin: "0 0 12px 0",
            }}
          >
            Período do Contrato
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {formattedStartDate} até {formattedEndDate}
            </span>
          </div>
        </div>

        {/* Payment Date */}
        <div style={{ textAlign: "center", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px", margin: "0 0 4px 0" }}>
            Data do Pagamento
          </p>
          <p style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937", margin: "0" }}>{formattedPaymentDate}</p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 4px 0" }}>
            Este é um comprovante eletrônico de pagamento
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>Emitido em {formattedNow}</p>
        </div>

        <style jsx>{`
          @media print {
            .receipt-container {
              page-break-inside: avoid;
              page-break-after: avoid;
              page-break-before: avoid;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    )
  },
)

PaymentReceipt.displayName = "PaymentReceipt"
