"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DashboardClient() {
  const router = useRouter()

  const handleNewContract = () => {
    router.push("/contratos/criar")
  }

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
      <Button
        onClick={handleNewContract}
        className="bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200"
      >
        <span className="mr-2">➕</span>
        Novo Contrato
      </Button>
    </div>
  )
}
