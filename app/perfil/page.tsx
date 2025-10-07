"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useUser } from "@/contexts/user-context"
import { Loader2, Save, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function PerfilPage() {
  const { profile, updateProfile, loading } = useUser()
  const [formData, setFormData] = useState({
    nome: profile?.nome || "",
    telefone: profile?.telefone || "",
    empresa: profile?.empresa || "",
    documento: profile?.documento || "",
    endereco: profile?.endereco || "",
    role: profile?.role || "cliente",
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      await updateProfile(formData)
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Perfil" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Perfil" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>Gerencie suas informações pessoais e de contato</CardDescription>
                <div className="h-1 w-16 bg-orange-500 rounded-full mt-2"></div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-orange-400">
                        Nome Completo
                      </Label>
                      <Input
                        id="nome"
                        type="text"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        required
                        disabled={isUpdating}
                        className="focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-orange-400">
                        Telefone
                      </Label>
                      <Input
                        id="telefone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                        disabled={isUpdating}
                        className="focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="empresa" className="text-orange-400">
                        Empresa
                      </Label>
                      <Input
                        id="empresa"
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => handleInputChange("empresa", e.target.value)}
                        disabled={isUpdating}
                        className="focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documento" className="text-orange-400">
                        CPF/CNPJ
                      </Label>
                      <Input
                        id="documento"
                        type="text"
                        value={formData.documento}
                        onChange={(e) => handleInputChange("documento", e.target.value)}
                        disabled={isUpdating}
                        className="focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-orange-400">
                      Endereço
                    </Label>
                    <Input
                      id="endereco"
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      disabled={isUpdating}
                      className="focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-orange-400">
                      Tipo de Usuário
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleInputChange("role", value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="operador">Operador</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isUpdating} className="bg-orange-600 hover:bg-orange-700">
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
