"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Phone, Building2, FileText, MapPin, Mail, Calendar, Download, Smartphone } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { createClient } from "@/lib/supabase/client"

export function ProfileSettings() {
  const { profile, updateProfile, refreshProfile } = useUser()
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    empresa: "",
    documento: "",
    endereco: "",
    email: "",
    cep: "",
    cidade: "",
    estado: "",
    role: "cliente" as const,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || "",
        telefone: profile.telefone || "",
        empresa: profile.empresa || "",
        documento: profile.documento || "",
        endereco: profile.endereco || "",
        email: profile.email || "",
        cep: profile.cep || "",
        cidade: profile.cidade || "",
        estado: profile.estado || "",
        role: profile.role || "cliente",
      })
    }
  }, [profile])

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      await updateProfile(formData)
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro ao atualizar perfil" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const supabase = createClient()

      // Export user profile data
      const exportData = {
        profile: profile,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `construloc-perfil-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Dados exportados com sucesso!" })
    } catch (error: any) {
      setMessage({ type: "error", text: "Erro ao exportar dados" })
    } finally {
      setIsExporting(false)
    }
  }

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("O app já está instalado ou não pode ser instalado neste dispositivo.")
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setMessage({ type: "success", text: "App instalado com sucesso!" })
      setIsInstallable(false)
    }

    setDeferredPrompt(null)
  }

  if (!profile) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-orange-500" />
            Informações do Perfil
          </CardTitle>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-gray-200 flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-500" />
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-gray-200 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-500" />
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento" className="text-gray-200 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Documento
                </Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => handleInputChange("documento", e.target.value)}
                  placeholder="CPF ou CNPJ"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="empresa" className="text-gray-200 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-500" />
                  Empresa
                </Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange("empresa", e.target.value)}
                  placeholder="Nome da empresa"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep" className="text-gray-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  CEP
                </Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  placeholder="00000-000"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-200">
                  Função
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco" className="text-gray-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  Endereço
                </Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                  placeholder="Rua, número, bairro"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-gray-200">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Cidade"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-gray-200">
                  Estado
                </Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md ${
                  message.type === "success"
                    ? "bg-green-900/30 border border-green-700 text-green-400"
                    : "bg-red-900/30 border border-red-700 text-red-400"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Informações do Sistema
          </CardTitle>
          <CardDescription>Dados sobre sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Data de Cadastro</p>
              <p className="text-white">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Última Atualização</p>
              <p className="text-white">
                {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString("pt-BR") : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">ID do Perfil</p>
              <p className="text-white font-mono text-xs">{profile.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Tipo de Conta</p>
              <p className="text-white capitalize">{profile.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-orange-500" />
            Download e Instalação
          </CardTitle>
          <CardDescription>Exporte seus dados ou instale o app no seu dispositivo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Data Button */}
            <div className="group relative overflow-hidden rounded-lg border border-orange-500/30 bg-gray-800/50 p-6 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 transition-transform group-hover:scale-110">
                    <Download className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Exportar Dados</h3>
                    <p className="text-sm text-gray-400">Backup do seu perfil</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  Faça download de todos os seus dados em formato JSON para backup ou transferência.
                </p>
                <Button
                  onClick={handleExportData}
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
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Dados
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Install App Button */}
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
                  Instale o ConstruLoc no seu dispositivo para acesso rápido e offline.
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
              <strong>Dica:</strong> Após instalar, você poderá acessar o ConstruLoc diretamente da tela inicial do seu
              dispositivo, como um app nativo!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileSettings
