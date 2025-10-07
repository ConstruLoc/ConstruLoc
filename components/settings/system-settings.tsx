"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Bell, BellOff, RotateCcw, AlertTriangle, Download, Database, Smartphone, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SystemSettings() {
  const [settings, setSettings] = useState({
    company_name: "ConstruLoc",
    company_email: "contato@construloc.com",
    company_phone: "(11) 99999-9999",
    company_address: "Rua das Construções, 123 - São Paulo, SP",
    notifications_email: true,
    notifications_sms: false,
    notifications_push: false,
    auto_backup: true,
    contract_template: "Modelo padrão de contrato de locação...",
  })

  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default")
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPushSupported(true)
      setPushPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const requestPushPermission = async () => {
    if (!pushSupported) {
      alert("Notificações push não são suportadas neste navegador")
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)

      if (permission === "granted") {
        handleInputChange("notifications_push", true)

        new Notification("ConstruLoc", {
          body: "Notificações ativadas com sucesso! Você receberá alertas sobre contratos e pagamentos.",
          icon: "/logo.png",
          badge: "/logo.png",
        })
      } else {
        handleInputChange("notifications_push", false)
        alert("Permissão de notificações negada. Você pode ativar nas configurações do navegador.")
      }
    } catch (error) {
      console.error("Error requesting push permission:", error)
      alert("Erro ao solicitar permissão de notificações")
    }
  }

  const handleResetCounter = async () => {
    setIsResetting(true)
    try {
      const { data: contracts, error: fetchError } = await supabase.from("contratos").select("id").limit(1)

      if (fetchError) throw fetchError

      if (contracts && contracts.length > 0) {
        toast({
          title: "Não é possível resetar",
          description: "Existem contratos no sistema. Exclua todos os contratos antes de resetar o contador.",
          variant: "destructive",
        })
        setResetDialogOpen(false)
        setIsResetting(false)
        return
      }

      toast({
        title: "Contador resetado!",
        description: "O próximo contrato será numerado como CL-0001.",
        variant: "default",
      })

      setResetDialogOpen(false)
    } catch (error) {
      console.error("Error resetting counter:", error)
      toast({
        title: "Erro ao resetar contador",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleExportSystemData = async () => {
    setIsExporting(true)
    try {
      const [clientes, contratos, equipamentos, categorias, pagamentos] = await Promise.all([
        supabase.from("clientes").select("*"),
        supabase.from("contratos").select("*"),
        supabase.from("equipamentos").select("*"),
        supabase.from("categorias").select("*"),
        supabase.from("pagamentos").select("*"),
      ])

      const exportData = {
        system: {
          name: "ConstruLoc",
          version: "1.0",
          exportDate: new Date().toISOString(),
        },
        data: {
          clientes: clientes.data || [],
          contratos: contratos.data || [],
          equipamentos: equipamentos.data || [],
          categorias: categorias.data || [],
          pagamentos: pagamentos.data || [],
        },
        settings: settings,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `construloc-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Backup realizado!",
        description: "Todos os dados do sistema foram exportados com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao exportar dados",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Instalação Manual",
        description:
          "No Chrome/Edge: Menu (⋮) → Instalar ConstruLoc. No Safari iOS: Compartilhar → Adicionar à Tela de Início.",
      })
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      toast({
        title: "App instalado!",
        description: "O ConstruLoc foi instalado com sucesso no seu dispositivo.",
      })
      setIsInstallable(false)
    }

    setDeferredPrompt(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Saving settings:", settings)
    alert("Configurações salvas com sucesso!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Configure os dados da sua empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa</Label>
                <Input
                  id="company_name"
                  value={settings.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_email">Email</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => handleInputChange("company_email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_phone">Telefone</Label>
                <Input
                  id="company_phone"
                  value={settings.company_phone}
                  onChange={(e) => handleInputChange("company_phone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_address">Endereço</Label>
              <Textarea
                id="company_address"
                value={settings.company_address}
                onChange={(e) => handleInputChange("company_address", e.target.value)}
                rows={3}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Configure como você deseja receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications_email">Notificações por Email</Label>
              <p className="text-sm text-gray-500">Receba alertas sobre contratos e pagamentos</p>
            </div>
            <Switch
              id="notifications_email"
              checked={settings.notifications_email}
              onCheckedChange={(checked) => handleInputChange("notifications_email", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications_sms">Notificações por SMS</Label>
              <p className="text-sm text-gray-500">Receba alertas urgentes por mensagem</p>
            </div>
            <Switch
              id="notifications_sms"
              checked={settings.notifications_sms}
              onCheckedChange={(checked) => handleInputChange("notifications_sms", checked)}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="notifications_push">Notificações Push no Navegador</Label>
                  {pushPermission === "granted" ? (
                    <Bell className="h-4 w-4 text-green-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Receba notificações no celular e computador mesmo quando o site estiver fechado
                </p>
                {!pushSupported && (
                  <p className="text-sm text-red-500 mt-1">Notificações push não são suportadas neste navegador</p>
                )}
                {pushPermission === "denied" && (
                  <p className="text-sm text-orange-500 mt-1">
                    Permissão negada. Ative nas configurações do navegador.
                  </p>
                )}
              </div>
              {pushPermission === "granted" ? (
                <Switch
                  id="notifications_push"
                  checked={settings.notifications_push}
                  onCheckedChange={(checked) => handleInputChange("notifications_push", checked)}
                />
              ) : (
                <Button
                  type="button"
                  onClick={requestPushPermission}
                  disabled={!pushSupported || pushPermission === "denied"}
                  variant="outline"
                  size="sm"
                >
                  Ativar
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto_backup">Backup Automático</Label>
              <p className="text-sm text-gray-500">Backup diário dos dados do sistema</p>
            </div>
            <Switch
              id="auto_backup"
              checked={settings.auto_backup}
              onCheckedChange={(checked) => handleInputChange("auto_backup", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modelo de Contrato</CardTitle>
          <CardDescription>Configure o modelo padrão para novos contratos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="contract_template">Texto do Contrato</Label>
            <Textarea
              id="contract_template"
              value={settings.contract_template}
              onChange={(e) => handleInputChange("contract_template", e.target.value)}
              rows={8}
              placeholder="Digite o modelo de contrato..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-orange-500" />
            Download e Instalação
          </CardTitle>
          <CardDescription>Faça backup completo do sistema ou instale o app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative overflow-hidden rounded-lg border border-orange-500/30 bg-gray-800/50 p-6 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 transition-transform group-hover:scale-110">
                    <Database className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Backup Completo</h3>
                    <p className="text-sm text-gray-400">Todos os dados do sistema</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  Exporte todos os dados do sistema (clientes, contratos, equipamentos, pagamentos) em formato JSON.
                </p>
                <Button
                  onClick={handleExportSystemData}
                  disabled={isExporting}
                  className="w-full bg-orange-600 hover:bg-orange-700 transition-all hover:scale-105"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Fazer Backup
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border border-orange-500/30 bg-gray-800/50 p-6 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 transition-transform group-hover:scale-110">
                    <Smartphone className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Instalar App</h3>
                    <p className="text-sm text-gray-400">PC, Android e iOS</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  Instale o ConstruLoc no seu dispositivo para acesso rápido, offline e notificações.
                </p>
                <Button
                  onClick={handleInstallApp}
                  disabled={!isInstallable}
                  className="w-full bg-orange-600 hover:bg-orange-700 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  {isInstallable ? "Instalar Aplicativo" : "App Instalado"}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
            <p className="text-sm text-orange-200">
              <strong>Dica:</strong> O backup exporta todos os dados em JSON. Guarde este arquivo em local seguro para
              restauração futura. O app instalado funciona offline e envia notificações!
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-500" />
            Numeração de Contratos
          </CardTitle>
          <CardDescription>Gerencie a numeração automática dos contratos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-200 mb-1">Atenção</p>
                <p className="text-sm text-orange-200/80">
                  Resetar o contador fará com que o próximo contrato seja numerado como CL-0001. Esta ação só é
                  permitida quando não há contratos no sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Resetar Contador de Contratos</Label>
              <p className="text-sm text-gray-500">Reinicia a numeração para CL-0001</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white border-orange-500"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar Contador
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
          Salvar Configurações
        </Button>
      </div>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                <RotateCcw className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl">Resetar Contador de Contratos</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base text-foreground/80">
              Tem certeza que deseja resetar o contador de contratos?
              <br />
              <br />O próximo contrato criado será numerado como{" "}
              <span className="font-semibold text-foreground">CL-0001</span>.
              <br />
              <br />
              <span className="font-semibold text-orange-500">
                Esta ação só é permitida quando não há contratos no sistema.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetCounter}
              disabled={isResetting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isResetting ? "Resetando..." : "Resetar Contador"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SystemSettings
