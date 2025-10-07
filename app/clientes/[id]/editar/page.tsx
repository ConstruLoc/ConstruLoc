import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/main-layout"
import { ClientForm } from "@/components/clients/client-form"

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch client details
  const { data: client, error } = await supabase.from("clientes").select("*").eq("id", id).single()

  if (error || !client) {
    notFound()
  }

  return (
    <MainLayout title="Editar Cliente" showBackButton>
      <div className="max-w-7xl mx-auto">
        <ClientForm client={client} />
      </div>
    </MainLayout>
  )
}
