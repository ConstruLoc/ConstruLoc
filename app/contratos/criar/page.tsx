import { MainLayout } from "@/components/layout/main-layout"
import { ContractCreationForm } from "@/components/contracts/contract-creation-form"

export default async function NewContractPage() {
  return (
    <MainLayout title="Novo Contrato" showBackButton={true}>
      <ContractCreationForm />
    </MainLayout>
  )
}
