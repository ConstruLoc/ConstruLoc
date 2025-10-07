"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ClientForm } from "@/components/clients/client-form"

export default function NewClientPage() {
  return (
    <MainLayout showBackButton={true} title="Novo Cliente">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Cliente</h1>
          <p className="text-gray-600 dark:text-gray-400">Cadastre um novo cliente no sistema</p>
        </div>

        <ClientForm />
      </div>
    </MainLayout>
  )
}
