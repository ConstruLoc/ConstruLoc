"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  BellOff,
  RotateCcw,
  AlertTriangle,
  Download,
  Database,
  Smartphone,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react"
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
import { sendPushNotification, startNotificationScheduler } from "@/lib/notifications"

export function SystemSettings() {
  const [settings, setSettings] = useState({
    company_name: "ConstruLoc",
    company_email: "contato@construloc.com",
    company_phone: "(11) 99999-9999",
    company_address: "Rua das Construções, 123 - São Paulo, SP",
    notifications_email: true,
    notifications_push: false,
    auto_backup: true,
    contract_template: "Modelo padrão de contrato de locação...",
  })

  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default")
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  const [showInstructions, setShowInstructions] = useState(false)
  const [isCheckingPermission, setIsCheckingPermission] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const checkPermission = () => {
      if ("Notification" in window && "serviceWorker" in navigator) {
        setPushSupported(true)
        setPushPermission(Notification.permission)
      }
    }

    checkPermission()

    const savedSettings = localStorage.getItem("system_settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    const checkSettings = localStorage.getItem("system_settings")
    if (checkSettings) {
      const parsed = JSON.parse(checkSettings)
      if (parsed.notifications_push && Notification.permission === "granted") {
        startNotificationScheduler()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkPermission()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
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

  const recheckPermission = () => {
    setIsCheckingPermission(true)
    setTimeout(() => {
      if ("Notification" in window) {
        const currentPermission = Notification.permission
        setPushPermission(currentPermission)

        if (currentPermission === "granted") {
          handleInputChange("notifications_push", true)
          toast({
            title: "Permissão concedida!",
            description: "As notificações estão ativas.",
          })
        } else if (currentPermission === "denied") {
          handleInputChange("notifications_push", false)
          toast({
            title: "Permissão bloqueada",
            description: "Siga as instruções para reativar.",
            variant: "destructive",
          })
        }
      }
      setIsCheckingPermission(false)
    }, 500)
  }

  const requestPushPermission = async () => {
    if (!pushSupported) {
      toast({
        title: "Não suportado",
        description: "Notificações push não são suportadas neste navegador",
        variant: "destructive",
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)

      if (permission === "granted") {
        handleInputChange("notifications_push", true)

        await sendPushNotification({
          title: "Notificações Ativadas!",
          body: "Você receberá alertas sobre contratos e pagamentos próximos do vencimento.",
          url: "/dashboard",
        })

        toast({
          title: "Notificações ativadas!",
          description: "Você receberá alertas 5 dias antes dos pagamentos.",
        })

        startNotificationScheduler()
      } else {
        handleInputChange("notifications_push", false)
        toast({
          title: "Permissão negada",
          description: "Você pode ativar nas configurações do navegador.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting push permission:", error)
      toast({
        title: "Erro",
        description: "Erro ao solicitar permissão de notificações",
        variant: "destructive",
      })
    }
  }

  const testNotification = async () => {
    setIsTesting(true)
    try {
      const success = await sendPushNotification({
        title: "🔔 Teste de Notificação",
        body: "Se você está vendo isso, as notificações estão funcionando perfeitamente!",
        url: "/dashboard",
      })

      if (success) {
        toast({
          title: "Notificação enviada!",
          description: "Verifique se a notificação apareceu no seu dispositivo.",
        })
      } else {
        toast({
          title: "Erro ao enviar",
          description: "Não foi possível enviar a notificação. Verifique as permissões.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao testar a notificação.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
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
    localStorage.setItem("system_settings", JSON.stringify(settings))
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas com sucesso.",
    })
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

      <Card className="overflow-hidden border-orange-500/30 bg-gradient-to-br from-gray-900 to-gray-800">
        <CardHeader className="border-b border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 backdrop-blur-sm">
              <Bell className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Central de Notificações</CardTitle>
              <CardDescription>Receba alertas sobre contratos e pagamentos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Notificações por Email */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 p-5 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 transition-transform group-hover:scale-110">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <Label htmlFor="notifications_email" className="text-base font-semibold text-white cursor-pointer">
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-gray-400 mt-1">Receba alertas sobre contratos e pagamentos no seu email</p>
                </div>
              </div>
              <Switch
                id="notifications_email"
                checked={settings.notifications_email}
                onCheckedChange={(checked) => handleInputChange("notifications_email", checked)}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>

          {/* Notificações Push */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                    pushPermission === "granted"
                      ? "bg-green-500/10 group-hover:scale-110"
                      : pushPermission === "denied"
                        ? "bg-red-500/10"
                        : "bg-orange-500/10 group-hover:scale-110"
                  }`}
                >
                  {pushPermission === "granted" ? (
                    <Bell className="h-5 w-5 text-green-400" />
                  ) : pushPermission === "denied" ? (
                    <BellOff className="h-5 w-5 text-red-400" />
                  ) : (
                    <Bell className="h-5 w-5 text-orange-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-base font-semibold text-white">Notificações Push</Label>
                    {pushPermission === "granted" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        Ativo
                      </span>
                    )}
                    {pushPermission === "denied" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
                        Bloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">Alertas 5 dias antes dos pagamentos, mesmo com o app fechado</p>

                  {/* Status Messages */}
                  {!pushSupported && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                      <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-300">Notificações push não são suportadas neste navegador</p>
                    </div>
                  )}

                  {pushPermission === "denied" && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-300 mb-1">Permissão Bloqueada</p>
                          <p className="text-xs text-red-300/80">
                            Você bloqueou as notificações. Clique no botão abaixo para ver como reativar.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => setShowInstructions(!showInstructions)}
                        variant="outline"
                        className="w-full border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300"
                      >
                        {showInstructions ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Ocultar Instruções
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Ver Como Reativar
                          </>
                        )}
                      </Button>

                      {/* Instruções colapsáveis */}
                      {showInstructions && (
                        <div className="rounded-lg bg-gray-900/50 border border-gray-700 p-4 space-y-3 animate-in slide-in-from-top-2">
                          <p className="text-sm font-semibold text-white">Como reativar notificações:</p>

                          <div className="space-y-2 text-xs text-gray-300">
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-orange-400 min-w-[80px]">Chrome/Edge:</span>
                              <span>
                                Clique no ícone de cadeado 🔒 ao lado da URL → Configurações do site → Notificações →
                                Permitir
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-orange-400 min-w-[80px]">Firefox:</span>
                              <span>
                                Clique no ícone de escudo 🛡️ → Configurações → Permissões → Notificações → Permitir
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-orange-400 min-w-[80px]">Safari:</span>
                              <span>Safari → Preferências → Sites → Notificações → Permitir para este site</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-orange-400 min-w-[80px]">Mobile:</span>
                              <span>Configurações do celular → Apps → Navegador → Notificações → Permitir</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-700">
                            <p className="text-xs text-gray-400">
                              Após alterar as configurações, clique no botão "Verificar Status" abaixo.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {pushPermission === "granted" && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                      <svg
                        className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-green-300">
                        Notificações ativadas! Funciona no celular e computador, mesmo com o app fechado.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {/* Botão de Ativar/Verificar Status */}
                <Button
                  type="button"
                  onClick={pushPermission === "denied" ? recheckPermission : requestPushPermission}
                  disabled={!pushSupported || isCheckingPermission}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isCheckingPermission ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : pushPermission === "denied" ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Verificar Status
                    </>
                  ) : pushPermission === "granted" ? (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Notificações Ativas
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Ativar Notificações Push
                    </>
                  )}
                </Button>

                {/* Botão de Testar - sempre visível */}
                <Button
                  type="button"
                  onClick={testNotification}
                  disabled={isTesting || pushPermission !== "granted"}
                  variant="outline"
                  className="w-full border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Testar Notificação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Dica sobre PWA */}
          <div className="relative overflow-hidden rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5 p-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="relative flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 flex-shrink-0">
                <Smartphone className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-200 mb-1">💡 Dica: Instale como App</p>
                <p className="text-sm text-orange-200/80 leading-relaxed">
                  Adicione o ConstruLoc à tela inicial do seu celular para receber notificações como um app nativo! As
                  notificações funcionam mesmo com o app fechado.
                  {pushPermission === "granted" && (
                    <> Use o botão "Testar Notificação" para verificar se está funcionando.</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Backup Automático */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 p-5 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 transition-transform group-hover:scale-110">
                  <Database className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="auto_backup" className="text-base font-semibold text-white cursor-pointer">
                    Backup Automático
                  </Label>
                  <p className="text-sm text-gray-400 mt-1">Backup diário automático dos dados do sistema</p>
                </div>
              </div>
              <Switch
                id="auto_backup"
                checked={settings.auto_backup}
                onCheckedChange={(checked) => handleInputChange("auto_backup", checked)}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
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
