import { MainLayout } from "@/components/layout/main-layout"
import { ClientList } from "@/components/clients/client-list"

export default async function ClientsPage() {
  return (
    <MainLayout showBackButton={true} title="Clientes">
      <div className="space-y-6">
        <ClientList />
      </div>
    </MainLayout>
  )
}
