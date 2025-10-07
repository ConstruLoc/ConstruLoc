"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Loader2, User, Mail, Phone, FileText, Building2, MapPin, MessageSquare, Hash } from "lucide-react"

interface ClientFormProps {
  client?: any
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const [formData, setFormData] = useState({
    nome: client?.nome || "",
    email: client?.email || "",
    telefone: client?.telefone || "",
    documento: client?.documento || "",
    tipo_documento: client?.tipo_documento || "CPF",
    empresa: client?.empresa || "",
    endereco: client?.endereco || "",
    numero: client?.numero || "",
    cep: client?.cep || "",
    observacoes: client?.observacoes || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatDocument = (value: string, type: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "")

    if (type === "CPF") {
      // Format CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else {
      // Format CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  const handleDocumentChange = (value: string) => {
    const formatted = formatDocument(value, formData.tipo_documento)
    handleInputChange("documento", formatted)
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange("telefone", formatted)
  }

  const fetchAddressFromCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "")

    // Only fetch if CEP has 8 digits
    if (cleanCEP.length !== 8) return

    setIsLoadingCEP(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (data.erro) {
        return
      }

      // Build complete address string
      const addressParts = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean)

      const fullAddress = addressParts.join(", ")

      handleInputChange("endereco", fullAddress)
    } catch (error) {
      console.error("Error fetching CEP:", error)
    } finally {
      setIsLoadingCEP(false)
    }
  }

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value)
    handleInputChange("cep", formatted)

    const cleanCEP = value.replace(/\D/g, "")
    if (cleanCEP.length === 8) {
      fetchAddressFromCEP(formatted)
    }
  }

  const handleCEPBlur = () => {
    if (formData.cep) {
      fetchAddressFromCEP(formData.cep)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const clientData = {
        ...formData,
        documento: formData.documento.replace(/\D/g, ""), // Store only numbers
        telefone: formData.telefone.replace(/\D/g, ""), // Store only numbers
        cep: formData.cep.replace(/\D/g, ""), // Store only numbers
      }

      if (client?.id) {
        // Update existing client
        const { error } = await supabase.from("clientes").update(clientData).eq("id", client.id)
        if (error) throw error
      } else {
        // Create new client
        const { error } = await supabase.from("clientes").insert([clientData])
        if (error) throw error
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/clientes")
      }
    } catch (error: any) {
      if (error.code === "23505") {
        if (error.message.includes("email")) {
          setError("Este email já está cadastrado")
        } else if (error.message.includes("documento")) {
          setError("Este documento já está cadastrado")
        } else {
          setError("Dados duplicados encontrados")
        }
      } else {
        setError(error.message || "Erro ao salvar cliente")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600/10 rounded-lg">
            <User className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-white text-2xl">{client ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
            <CardDescription className="text-slate-400">
              {client ? "Atualize as informações do cliente" : "Preencha os dados do cliente"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              <div className="h-1 w-8 bg-orange-600 rounded-full" />
              <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2 text-slate-300">
                  <User className="h-4 w-4 text-orange-600" />
                  Nome Completo
                  <span className="text-orange-600">*</span>
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Nome completo do cliente"
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 text-orange-600" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-4 w-4 text-orange-600" />
                  Telefone
                  <span className="text-orange-600">*</span>
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_documento" className="flex items-center gap-2 text-slate-300">
                  <FileText className="h-4 w-4 text-orange-600" />
                  Tipo de Documento
                  <span className="text-orange-600">*</span>
                </Label>
                <Select
                  value={formData.tipo_documento}
                  onValueChange={(value) => {
                    handleInputChange("tipo_documento", value)
                    handleInputChange("documento", "")
                  }}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white focus:border-orange-600 focus:ring-orange-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="CPF">CPF - Pessoa Física</SelectItem>
                    <SelectItem value="CNPJ">CNPJ - Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento" className="flex items-center gap-2 text-slate-300">
                  <FileText className="h-4 w-4 text-orange-600" />
                  {formData.tipo_documento}
                </Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  placeholder={formData.tipo_documento === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
                  maxLength={formData.tipo_documento === "CPF" ? 14 : 18}
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa" className="flex items-center gap-2 text-slate-300">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Empresa
                </Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange("empresa", e.target.value)}
                  placeholder="Nome da empresa (opcional)"
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              <div className="h-1 w-8 bg-orange-600 rounded-full" />
              <h3 className="text-lg font-semibold text-white">Endereço</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep" className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  CEP
                </Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleCEPChange(e.target.value)}
                    onBlur={handleCEPBlur}
                    placeholder="00000-000"
                    maxLength={9}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600 font-mono"
                    disabled={isLoadingCEP}
                  />
                  {isLoadingCEP && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco" className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Endereço Completo
                </Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                  placeholder="Rua, número, bairro, cidade, estado, complemento..."
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero" className="flex items-center gap-2 text-slate-300">
                  <Hash className="h-4 w-4 text-slate-400" />
                  Número
                </Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="Número"
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              <div className="h-1 w-8 bg-orange-600 rounded-full" />
              <h3 className="text-lg font-semibold text-white">Informações Adicionais</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="flex items-center gap-2 text-slate-300">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder="Observações adicionais sobre o cliente..."
                rows={4}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-600 focus:ring-orange-600"
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {client ? "Atualizar" : "Cadastrar"} Cliente
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/clientes")}
              disabled={isLoading}
              className="border-slate-700 bg-slate-900 hover:bg-slate-700 text-white"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
