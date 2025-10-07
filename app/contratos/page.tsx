import { MainLayout } from "@/components/layout/main-layout"
import { ContractList } from "@/components/contracts/contract-list"

export default async function ContractsPage() {
  return (
    <MainLayout showBackButton={true} title="Contratos">
      <div className="space-y-6">
        <ContractList />
      </div>
    </MainLayout>
  )
}
