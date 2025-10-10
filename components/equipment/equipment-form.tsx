"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Loader2, Save, Upload } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { uploadImage } from "@/app/actions/upload-image"
import { useToast } from "@/hooks/use-toast"

interface EquipmentFormProps {
  equipment?: any
  categories: any[]
  onSuccess?: () => void
}

export function EquipmentForm({ equipment, categories, onSuccess }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    nome: equipment?.nome || "",
    descricao: equipment?.descricao || "",
    numero_serie: equipment?.numero_serie || "",
    localizacao: equipment?.localizacao || "",
    valor_diario: equipment?.valor_diario || "",
    categoria_id: equipment?.categoria_id || "",
    status: equipment?.status || "disponivel",
    quantidade: equipment?.quantidade || 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | undefined>(equipment?.imagem_url)
  const [uploadingImage, setUploadingImage] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  console.log("[v0] Categories in form:", categories)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(equipment?.imagem_url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!formData.categoria_id || formData.categoria_id.trim() === "") {
        throw new Error("Por favor, selecione uma categoria")
      }

      let imageUrl = equipment?.imagem_url
      if (selectedFile) {
        setUploadingImage(true)
        const formDataUpload = new FormData()
        formDataUpload.append("file", selectedFile)

        const result = await uploadImage(formDataUpload)
        setUploadingImage(false)

        if (!result.success) {
          throw new Error(result.error || "Erro ao fazer upload da imagem")
        }

        imageUrl = result.url
      }

      if (formData.numero_serie && formData.numero_serie.trim() !== "" && !equipment?.id) {
        const { data: existingEquipment } = await supabase
          .from("equipamentos")
          .select("id")
          .eq("numero_serie", formData.numero_serie.trim())
          .single()

        if (existingEquipment) {
          throw new Error("Já existe um equipamento com este número de série")
        }
      }

      const equipmentData = {
        nome: formData.nome,
        descricao: formData.descricao,
        numero_serie: formData.numero_serie.trim() || null,
        localizacao: formData.localizacao.trim() || null,
        valor_diario: Number.parseFloat(formData.valor_diario.toString()),
        categoria_id: formData.categoria_id.trim(),
        status: formData.status,
        quantidade: Number.parseInt(formData.quantidade.toString()) || 1,
        valor_semanal: null,
        valor_mensal: null,
        imagem_url: imageUrl,
      }

      console.log("[v0] Submitting equipment data:", equipmentData)

      if (equipment?.id) {
        console.log("[v0] Updating equipment with ID:", equipment.id)
        const { error: updateError, data: updatedData } = await supabase
          .from("equipamentos")
          .update(equipmentData)
          .eq("id", equipment.id)
          .select()

        console.log("[v0] Update result:", { error: updateError, data: updatedData })

        if (updateError) throw updateError

        toast({
          title: "Equipamento atualizado!",
          description: "As alterações foram salvas com sucesso.",
        })

        router.refresh()
        setTimeout(() => {
          router.push("/equipamentos")
        }, 500)
      } else {
        const { error: insertError } = await supabase.from("equipamentos").insert([equipmentData])
        if (insertError) throw insertError

        toast({
          title: "Equipamento criado!",
          description: "O equipamento foi adicionado com sucesso.",
        })

        router.refresh()
        setTimeout(() => {
          router.push("/equipamentos")
        }, 500)
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("[v0] Equipment form submission error:", error.message)
      if (error.message?.includes("duplicate key value violates unique constraint")) {
        if (error.message.includes("numero_serie")) {
          setError("Já existe um equipamento com este número de série")
        } else {
          setError("Já existe um equipamento com estes dados")
        }
      } else {
        setError(error.message || "Erro ao salvar equipamento")
      }

      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o equipamento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadingImage(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Informações do Equipamento</h2>
          <p className="text-gray-400 text-sm">Preencha os dados do equipamento abaixo</p>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-3">
          <Label className="text-white font-semibold flex items-center gap-2">
            <Upload className="h-4 w-4 text-orange-500" />
            Imagem do Equipamento
          </Label>
          <FileUpload onFileSelect={handleFileSelect} preview={imagePreview} maxSize={5} accept="image/*" />
          {uploadingImage && (
            <p className="text-sm text-orange-400 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Fazendo upload da imagem...
            </p>
          )}
          <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <Label htmlFor="nome" className="text-white font-semibold">
              Nome do Equipamento *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Ex: Betoneira 400L"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 h-12 text-base"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="descricao" className="text-white font-semibold">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descrição detalhada do equipamento..."
              rows={4}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 resize-none text-base"
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="numero_serie" className="text-white font-semibold">
              Número de Série
            </Label>
            <Input
              id="numero_serie"
              value={formData.numero_serie}
              onChange={(e) => handleInputChange("numero_serie", e.target.value)}
              placeholder="Ex: BT400-001"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 h-12 text-base"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="localizacao" className="text-white font-semibold">
              Localização
            </Label>
            <Input
              id="localizacao"
              value={formData.localizacao}
              onChange={(e) => handleInputChange("localizacao", e.target.value)}
              placeholder="Ex: Galpão A - Prateleira 3"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 h-12 text-base"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="valor_diario" className="text-white font-semibold">
              Preço Diário (R$) *
            </Label>
            <Input
              id="valor_diario"
              type="number"
              step="0.01"
              value={formData.valor_diario}
              onChange={(e) => handleInputChange("valor_diario", e.target.value)}
              placeholder="0,00"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 h-12 text-base"
              required
            />
          </div>
        </div>

        {/* Status and Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="categoria" className="text-white font-semibold">
              Categoria *
            </Label>
            <Select value={formData.categoria_id} onValueChange={(value) => handleInputChange("categoria_id", value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500 h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.length === 0 ? (
                  <div className="px-2 py-6 text-center text-gray-400 text-sm">
                    Nenhuma categoria disponível.
                    <br />
                    Adicione categorias primeiro.
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-700">
                      {category.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="status" className="text-white font-semibold">
              Status *
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="disponivel" className="text-white hover:bg-gray-700">
                  Disponível
                </SelectItem>
                <SelectItem value="locado" className="text-white hover:bg-gray-700">
                  Locado
                </SelectItem>
                <SelectItem value="manutencao" className="text-white hover:bg-gray-700">
                  Manutenção
                </SelectItem>
                <SelectItem value="inativo" className="text-white hover:bg-gray-700">
                  Inativo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="quantidade" className="text-white font-semibold">
              Quantidade *
            </Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={(e) => handleInputChange("quantidade", Number.parseInt(e.target.value))}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 h-12 text-base"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-6 border-t border-gray-700">
        <Button
          type="submit"
          disabled={isLoading || uploadingImage}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 h-12 text-base"
        >
          {(isLoading || uploadingImage) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {!isLoading && !uploadingImage && <Save className="mr-2 h-5 w-5" />}
          Salvar Equipamento
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/equipamentos")}
          disabled={isLoading || uploadingImage}
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 px-8 h-12 text-base"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
