import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/main-layout"
import { EquipmentForm } from "@/components/equipment/equipment-form"

export default async function NewEquipmentPage() {
  const supabase = await createClient()

  // Fetch categories for the form
  const { data: categories, error } = await supabase.from("categorias_equipamentos").select("*").order("nome")

  console.log("[v0] Categories fetched:", categories)
  console.log("[v0] Categories error:", error)

  return (
    <MainLayout showBackButton={true} title="Novo Equipamento">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Novo Equipamento</h1>
            <p className="text-gray-400">Adicionar um novo equipamento ao inventário</p>
          </div>
          <EquipmentForm categories={categories || []} />
        </div>
      </div>
    </MainLayout>
  )
}
