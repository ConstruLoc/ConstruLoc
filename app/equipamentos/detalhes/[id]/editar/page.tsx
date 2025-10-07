import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { EquipmentForm } from "@/components/equipment/equipment-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch equipment details
  const { data: equipment, error } = await supabase.from("equipamentos").select("*").eq("id", id).single()

  if (error || !equipment) {
    notFound()
  }

  // Fetch categories for the form
  const { data: categories } = await supabase.from("categorias_equipamentos").select("*").order("nome")

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Editar Equipamento" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/equipamentos">
              <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Equipamentos
              </Button>
            </Link>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <EquipmentForm equipment={equipment} categories={categories || []} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
