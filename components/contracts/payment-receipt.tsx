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
  paymentStatus?: "pendente" | "pago" | "atrasado"
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
      paymentStatus = "pago",
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

    const getStatusConfig = () => {
      switch (paymentStatus) {
        case "pago":
          return {
            title: "Comprovante de Pagamento",
            subtitle: "✓ Pagamento recebido com sucesso",
            icon: (
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
            ),
            backgroundColor: "#dcfce7",
            borderColor: "#16a34a",
            dateLabel: "Data do Pagamento",
            statusLabel: "PAGO",
            statusColor: "#16a34a",
            valueColor: "#16a34a",
          }
        case "atrasado":
          return {
            title: "Comprovante de Pagamento",
            subtitle: "⚠ Pagamento em atraso - Aguardando regularização",
            icon: (
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ),
            backgroundColor: "#fee2e2",
            borderColor: "#dc2626",
            dateLabel: "Data de Vencimento (VENCIDO)",
            statusLabel: "ATRASADO",
            statusColor: "#dc2626",
            valueColor: "#dc2626",
          }
        default:
          return {
            title: "Comprovante de Pagamento",
            subtitle: "⏱ Pagamento pendente - Aguardando confirmação",
            icon: (
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#eab308"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
            backgroundColor: "#fef9c3",
            borderColor: "#eab308",
            dateLabel: "Data de Vencimento",
            statusLabel: "PENDENTE",
            statusColor: "#eab308",
            valueColor: "#1f2937",
          }
      }
    }

    const statusConfig = getStatusConfig()

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
              backgroundColor: statusConfig.backgroundColor,
              borderRadius: "50%",
              marginBottom: "16px",
              border: `3px solid ${statusConfig.borderColor}`,
            }}
          >
            {statusConfig.icon}
          </div>
          <h2
            style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px", margin: "0 0 8px 0" }}
          >
            {statusConfig.title}
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 12px 0" }}>{statusConfig.subtitle}</p>
          <div
            style={{
              display: "inline-block",
              padding: "8px 24px",
              backgroundColor: statusConfig.backgroundColor,
              border: `2px solid ${statusConfig.borderColor}`,
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: "bold",
              color: statusConfig.statusColor,
              letterSpacing: "0.05em",
            }}
          >
            STATUS: {statusConfig.statusLabel}
          </div>
        </div>

        {/* Payment Details */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
            border: `2px solid ${statusConfig.borderColor}`,
          }}
        >
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
              {paymentStatus === "pago" ? "Valor Pago" : "Valor a Pagar"}
            </p>
            <p style={{ fontSize: "30px", fontWeight: "bold", color: statusConfig.valueColor, margin: "0" }}>
              {formattedValue}
            </p>
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
        <div
          style={{
            textAlign: "center",
            paddingTop: "24px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: statusConfig.backgroundColor,
            padding: "16px",
            borderRadius: "8px",
            border: `1px solid ${statusConfig.borderColor}`,
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: statusConfig.statusColor,
              marginBottom: "4px",
              margin: "0 0 4px 0",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {statusConfig.dateLabel}
          </p>
          <p style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937", margin: "0" }}>{formattedPaymentDate}</p>
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
