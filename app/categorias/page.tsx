import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/main-layout"
import { CategoriesClient } from "@/components/categories/categories-client"

export default async function CategoriasPage() {
  const supabase = await createClient()

  const { data: categorias } = await supabase
    .from("categorias_equipamentos")
    .select(`
      *,
      equipamentos:equipamentos(count)
    `)
    .order("nome")

  // Transform data to include equipment count
  const categoriasWithCount =
    categorias?.map((cat) => ({
      ...cat,
      equipamentos: cat.equipamentos?.[0]?.count || 0,
    })) || []

  return (
    <MainLayout showBackButton={true} title="Categorias">
      <CategoriesClient initialCategories={categoriasWithCount} />
    </MainLayout>
  )
}
