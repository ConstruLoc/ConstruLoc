import { Header } from "@/components/layout/header"
import { ContractCreationForm } from "@/components/contracts/contract-creation-form"

export default async function NewContractPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Header title="Novo Contrato" />
        <ContractCreationForm />
      </div>
    </div>
  )
}
