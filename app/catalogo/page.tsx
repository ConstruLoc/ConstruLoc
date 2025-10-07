"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Construction, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CatalogoPage() {
  const router = useRouter()

  return (
    <MainLayout showBackButton={true} title="Catálogo">
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Construction className="w-16 h-16 text-orange-500" />
              </div>
              <CardTitle className="text-2xl">Catálogo em Desenvolvimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
              </p>
              <Button onClick={() => router.push("/dashboard")} className="w-full construloc-gradient">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
