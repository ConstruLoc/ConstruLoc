import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #FF6B35",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    borderBottom: "1 solid #ddd",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "40%",
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    width: "60%",
    color: "#333",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FF6B35",
    padding: 8,
    fontWeight: "bold",
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
    padding: 8,
  },
  tableCol1: {
    width: "40%",
  },
  tableCol2: {
    width: "20%",
    textAlign: "right",
  },
  tableCol3: {
    width: "20%",
    textAlign: "right",
  },
  tableCol4: {
    width: "20%",
    textAlign: "right",
  },
  total: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#999",
    fontSize: 9,
    borderTop: "1 solid #ddd",
    paddingTop: 10,
  },
  statusBadge: {
    padding: "4 8",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
  },
  statusPendente: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  statusAtivo: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
  },
  statusFinalizado: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  statusCancelado: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
})

interface ContractPDFProps {
  contract: any
}

export function ContractPDF({ contract }: ContractPDFProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: "Pendente",
      ativo: "Ativo",
      finalizado: "Finalizado",
      cancelado: "Cancelado",
    }
    return labels[status] || status
  }

  const calculateDays = () => {
    const start = new Date(contract.data_inicio)
    const end = new Date(contract.data_fim)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ConstruLoc</Text>
          <Text style={styles.subtitle}>Relatório de Contrato de Locação</Text>
        </View>

        {/* Contract Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Contrato</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Número do Contrato:</Text>
            <Text style={styles.value}>{contract.numero_contrato}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{getStatusLabel(contract.status)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Início:</Text>
            <Text style={styles.value}>{formatDate(contract.data_inicio)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Término:</Text>
            <Text style={styles.value}>{formatDate(contract.data_fim)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Período:</Text>
            <Text style={styles.value}>{calculateDays()} dia(s)</Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{contract.clientes?.nome || "N/A"}</Text>
          </View>
          {contract.clientes?.empresa && (
            <View style={styles.row}>
              <Text style={styles.label}>Empresa:</Text>
              <Text style={styles.value}>{contract.clientes.empresa}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{contract.clientes?.email || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{contract.clientes?.telefone || "N/A"}</Text>
          </View>
          {contract.endereco_instalacao && (
            <View style={styles.row}>
              <Text style={styles.label}>Endereço de Instalação:</Text>
              <Text style={styles.value}>{contract.endereco_instalacao}</Text>
            </View>
          )}
        </View>

        {/* Equipment List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipamentos Locados</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol1}>Equipamento</Text>
              <Text style={styles.tableCol2}>Qtd</Text>
              <Text style={styles.tableCol3}>Valor Unit.</Text>
              <Text style={styles.tableCol4}>Total</Text>
            </View>
            {contract.itens_contrato?.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{item.equipamentos?.nome || "N/A"}</Text>
                <Text style={styles.tableCol2}>{item.quantidade}</Text>
                <Text style={styles.tableCol3}>{formatCurrency(item.valor_unitario)}</Text>
                <Text style={styles.tableCol4}>{formatCurrency(item.valor_total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total */}
        <View style={styles.total}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor Total do Contrato:</Text>
            <Text style={styles.totalValue}>{formatCurrency(contract.valor_total || 0)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Valor por Dia:</Text>
            <Text style={styles.value}>{formatCurrency((contract.valor_total || 0) / calculateDays())}</Text>
          </View>
        </View>

        {/* Observations */}
        {contract.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.value}>{contract.observacoes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento gerado em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
          </Text>
          <Text>ConstruLoc - Sistema de Gestão de Locação de Equipamentos</Text>
        </View>
      </Page>
    </Document>
  )
}
