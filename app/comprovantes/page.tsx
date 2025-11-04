import { createServerClient } from "@/lib/supabase/server"
import { Receipt } from "lucide-react"
import { ClientReceiptsList } from "@/components/receipts/client-receipts-list"

export default async function ComprovantesPage() {
  const supabase = await createServerClient()

  // Buscar todos os clientes com seus contratos
  const { data: clientes, error } = await supabase
    .from("clientes")
    .select(`
      *,
      contratos (
        id,
        numero_contrato,
        data_inicio,
        data_fim,
        status,
        valor_mensal
      )
    `)
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao buscar clientes:", error)
    return (
      <div className="p-8">
        <div className="text-center text-red-500">Erro ao carregar clientes. Tente novamente.</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Receipt className="w-8 h-8 text-orange-500" />
            Comprovantes
          </h1>
          <p className="text-muted-foreground mt-2">Gere comprovantes de pagamentos de qualquer data</p>
        </div>
      </div>

      {/* Lista de Clientes */}
      <ClientReceiptsList clientes={clientes || []} />
    </div>
  )
}
