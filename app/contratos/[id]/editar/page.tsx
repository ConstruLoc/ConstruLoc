import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { ContractCreationForm } from "@/components/contracts/contract-creation-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch contract details with items
  const { data: contract, error } = await supabase
    .from("contratos")
    .select(`
      *,
      itens_contrato (
        *,
        equipamentos (
          nome, marca, modelo, valor_diario, imagem_url
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error || !contract) {
    notFound()
  }

  // Transform items for the form
  const contractWithItems = {
    ...contract,
    itens_contrato: contract.itens_contrato.map((item: any) => ({
      equipamento_id: item.equipamento_id,
      equipamento: {
        id: item.equipamento_id,
        nome: item.equipamentos.nome,
        marca: item.equipamentos.marca,
        modelo: item.equipamentos.modelo,
        valor_diario: item.equipamentos.valor_diario,
        imagem_url: item.equipamentos.imagem_url,
      },
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      valor_total: item.valor_total,
    })),
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
            >
              <Link href="/contratos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Contratos
              </Link>
            </Button>
          </div>
          <ContractCreationForm contract={contractWithItems} />
        </div>
      </div>
    </div>
  )
}
