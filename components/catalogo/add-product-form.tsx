"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Loader2, Package, DollarSign, ImageIcon, Tag, FileText, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AddProductForm({
  onSuccess,
  onCancel,
  editingProduct,
}: {
  onSuccess?: () => void
  onCancel?: () => void
  editingProduct?: any
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco_normal: "",
    preco_diario: "",
    imagem_url: "",
    especificacoes: "",
    disponivel: true,
    destaque: false,
  })

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        nome: editingProduct.nome || "",
        descricao: editingProduct.descricao || "",
        categoria: editingProduct.categoria || "",
        preco_normal: editingProduct.preco_normal?.toString() || "",
        preco_diario: editingProduct.preco_diario?.toString() || "",
        imagem_url: editingProduct.imagem_url || "",
        especificacoes: editingProduct.especificacoes?.join(", ") || "",
        disponivel: editingProduct.disponivel ?? true,
        destaque: editingProduct.destaque ?? false,
      })
      if (editingProduct.imagem_url) {
        setImagePreview(editingProduct.imagem_url)
      }
    }
  }, [editingProduct])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData({ ...formData, imagem_url: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview("")
    setFormData({ ...formData, imagem_url: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const especificacoesArray = formData.especificacoes
        .split(",")
        .map((spec) => spec.trim())
        .filter((spec) => spec.length > 0)

      const payload = {
        nome: formData.nome || null,
        descricao: formData.descricao || null,
        categoria: formData.categoria || null,
        preco_normal: formData.preco_normal ? Number.parseFloat(formData.preco_normal) : null,
        preco_diario: formData.preco_diario ? Number.parseFloat(formData.preco_diario) : null,
        imagem_url: formData.imagem_url || null,
        especificacoes: especificacoesArray.length > 0 ? especificacoesArray : null,
        disponivel: formData.disponivel,
        destaque: formData.destaque,
      }

      const url = editingProduct ? `/api/catalogo?id=${editingProduct.id}` : "/api/catalogo"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Erro ao ${editingProduct ? "atualizar" : "adicionar"} produto`)
      }

      toast({
        title: editingProduct ? "Produto atualizado!" : "Produto adicionado!",
        description: `O produto foi ${editingProduct ? "atualizado" : "adicionado ao catálogo"} com sucesso.`,
      })

      setFormData({
        nome: "",
        descricao: "",
        categoria: "",
        preco_normal: "",
        preco_diario: "",
        imagem_url: "",
        especificacoes: "",
        disponivel: true,
        destaque: false,
      })
      setImagePreview("")

      onSuccess?.()
    } catch (error) {
      console.error("[v0] Erro ao salvar produto:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar produto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="h-5 w-5 text-orange-500" />
          {editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}
        </CardTitle>
        <CardDescription className="text-slate-300">
          {editingProduct ? "Atualize os dados do produto" : "Preencha os dados do produto para adicionar ao catálogo"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500 font-semibold">
              <FileText className="h-4 w-4" />
              <span>Informações Básicas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-white">
                  Nome do Produto
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Escavadeira Hidráulica"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-white">
                  Categoria
                </Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Escavadeiras"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-white">
                Descrição
              </Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o produto..."
                rows={3}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500 font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>Preços</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco_normal" className="text-white">
                  Preço Normal (R$)
                </Label>
                <Input
                  id="preco_normal"
                  type="number"
                  step="0.01"
                  value={formData.preco_normal}
                  onChange={(e) => setFormData({ ...formData, preco_normal: e.target.value })}
                  placeholder="0.00"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_diario" className="text-white">
                  Preço Diário (R$)
                </Label>
                <Input
                  id="preco_diario"
                  type="number"
                  step="0.01"
                  value={formData.preco_diario}
                  onChange={(e) => setFormData({ ...formData, preco_diario: e.target.value })}
                  placeholder="0.00"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500 font-semibold">
              <ImageIcon className="h-4 w-4" />
              <span>Imagem do Produto</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem" className="text-white">
                Selecionar Imagem
              </Label>
              <div className="flex flex-col gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="imagem"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Imagem do Dispositivo
                </Button>

                {imagePreview && (
                  <div className="relative w-full h-48 bg-slate-800 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="especificacoes" className="text-white">
                Especificações (separadas por vírgula)
              </Label>
              <Textarea
                id="especificacoes"
                value={formData.especificacoes}
                onChange={(e) => setFormData({ ...formData, especificacoes: e.target.value })}
                placeholder="Ex: 20 toneladas, Motor 150HP, Alcance 9.5m"
                rows={2}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500 font-semibold">
              <Tag className="h-4 w-4" />
              <span>Opções</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="disponivel" className="text-white">
                  Disponível
                </Label>
                <p className="text-sm text-slate-400">Produto disponível para locação</p>
              </div>
              <Switch
                id="disponivel"
                checked={formData.disponivel}
                onCheckedChange={(checked) => setFormData({ ...formData, disponivel: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="destaque" className="text-white">
                  Produto em Destaque
                </Label>
                <p className="text-sm text-slate-400">Destacar este produto no catálogo</p>
              </div>
              <Switch
                id="destaque"
                checked={formData.destaque}
                onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingProduct ? "Atualizando..." : "Adicionando..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {editingProduct ? "Atualizar Produto" : "Adicionar Produto"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
