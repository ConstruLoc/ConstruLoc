"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User } from "lucide-react"
import ProfileSettings from "@/components/settings/profile-settings"
import SystemSettings from "@/components/settings/system-settings"
import { MainLayout } from "@/components/layout/main-layout"

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("perfil")

  return (
    <MainLayout showBackButton={true} title="Configurações">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">Gerencie suas preferências e configurações do sistema</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger
              value="perfil"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="sistema"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="mr-2 h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="mt-6">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="sistema" className="mt-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
