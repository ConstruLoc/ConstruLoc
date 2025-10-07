"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, Star, Package, MoreVertical, Eye, Calendar, DollarSign } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/ui/file-upload"

interface ProdutoCatalogo {
  id: string
  nome: string
  descricao: string
  categoria: string
  preco_diario: number
  preco_normal?: number // Adicionando preço normal
  preco_semanal?: number
  preco_mensal?: number
  imagem_url?: string
  especificacoes: string[]
  disponivel: boolean
  destaque: boolean
}

export default function GerenciarCatalogoPage() {
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false) // Adicionando dialog de detalhes
  const [selectedProduct, setSelectedProduct] = useState<ProdutoCatalogo | null>(null) // Produto selecionado para detalhes
  const [editingProduct, setEditingProduct] = useState<ProdutoCatalogo | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // Arquivo selecionado
  const [imagePreview, setImagePreview] = useState<string>("") // Preview da imagem
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco_diario: "",
    preco_normal: "", // Adicionando preço normal
    preco_semanal: "",
    preco_mensal: "",
    imagem_url: "",
    especificacoes: "",
    disponivel: true,
    destaque: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadProdutos()
  }, [])

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview("")
    }
  }

  const loadProdutos = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("produtos_catalogo")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setProdutos(data || [])
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const supabase = createClient()
      const especificacoesArray = formData.especificacoes
        .split("\n")
        .filter((spec) => spec.trim())
        .map((spec) => spec.trim())

      const produtoData = {
        nome: formData.nome || "Produto sem nome", // Valor padrão se vazio
        descricao: formData.descricao || "",
        categoria: formData.categoria || "Outros", // Valor padrão se vazio
        preco_diario: formData.preco_diario ? Number.parseFloat(formData.preco_diario) : 0, // Valor padrão 0
        preco_normal: formData.preco_normal ? Number.parseFloat(formData.preco_normal) : null,
        preco_semanal: formData.preco_semanal ? Number.parseFloat(formData.preco_semanal) : null,
        preco_mensal: formData.preco_mensal ? Number.parseFloat(formData.preco_mensal) : null,
        imagem_url: imagePreview || formData.imagem_url || null,
        especificacoes: especificacoesArray,
        disponivel: formData.disponivel,
        destaque: formData.destaque,
      }

      let error
      if (editingProduct) {
        const result = await supabase.from("produtos_catalogo").update(produtoData).eq("id", editingProduct.id)
        error = result.error
      } else {
        const result = await supabase.from("produtos_catalogo").insert([produtoData])
        error = result.error
      }

      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Produto ${editingProduct ? "atualizado" : "criado"} com sucesso!`,
      })

      setDialogOpen(false)
      resetForm()
      loadProdutos()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (produto: ProdutoCatalogo) => {
    setEditingProduct(produto)
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      categoria: produto.categoria,
      preco_diario: produto.preco_diario.toString(),
      preco_normal: produto.preco_normal?.toString() || "", // Incluindo preço normal
      preco_semanal: produto.preco_semanal?.toString() || "",
      preco_mensal: produto.preco_mensal?.toString() || "",
      imagem_url: produto.imagem_url || "",
      especificacoes: produto.especificacoes?.join("\n") || "",
      disponivel: produto.disponivel,
      destaque: produto.destaque,
    })
    if (produto.imagem_url) {
      setImagePreview(produto.imagem_url)
    }
    setDialogOpen(true)
  }

  const handleDetails = (produto: ProdutoCatalogo) => {
    setSelectedProduct(produto)
    setDetailsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("produtos_catalogo").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      })
      loadProdutos()
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setSelectedFile(null) // Resetando arquivo selecionado
    setImagePreview("") // Resetando preview
    setFormData({
      nome: "",
      descricao: "",
      categoria: "",
      preco_diario: "",
      preco_normal: "", // Resetando preço normal
      preco_semanal: "",
      preco_mensal: "",
      imagem_url: "",
      especificacoes: "",
      disponivel: true,
      destaque: false,
    })
  }

  if (loading) {
    return (
      <MainLayout showBackButton={true} title="Gerenciar Catálogo">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout showBackButton={true} title="Gerenciar Catálogo">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🛠️ Gerenciar Catálogo</h1>
            <p className="text-muted-foreground">Adicione e gerencie produtos do catálogo</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingProduct ? "Editar Produto" : "Novo Produto do Catálogo"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Escavadeira Hidráulica"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Escavadeiras">Escavadeiras</SelectItem>
                        <SelectItem value="Betoneiras">Betoneiras</SelectItem>
                        <SelectItem value="Guindastes">Guindastes</SelectItem>
                        <SelectItem value="Compactadores">Compactadores</SelectItem>
                        <SelectItem value="Retroescavadeiras">Retroescavadeiras</SelectItem>
                        <SelectItem value="Ferramentas">Ferramentas</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    placeholder="Descreva as características principais do produto..."
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Preços
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preco_diario">Preço por Dia (R$)</Label>
                      <Input
                        id="preco_diario"
                        type="number"
                        step="0.01"
                        value={formData.preco_diario}
                        onChange={(e) => setFormData({ ...formData, preco_diario: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preco_normal">Preço Normal (R$)</Label>
                      <Input
                        id="preco_normal"
                        type="number"
                        step="0.01"
                        value={formData.preco_normal}
                        onChange={(e) => setFormData({ ...formData, preco_normal: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preco_semanal">Preço Semanal (R$)</Label>
                      <Input
                        id="preco_semanal"
                        type="number"
                        step="0.01"
                        value={formData.preco_semanal}
                        onChange={(e) => setFormData({ ...formData, preco_semanal: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preco_mensal">Preço Mensal (R$)</Label>
                      <Input
                        id="preco_mensal"
                        type="number"
                        step="0.01"
                        value={formData.preco_mensal}
                        onChange={(e) => setFormData({ ...formData, preco_mensal: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Imagem do Produto</Label>
                  <FileUpload onFileSelect={handleFileSelect} preview={imagePreview} maxSize={5} />
                  <div className="text-sm text-muted-foreground">Ou insira uma URL da imagem:</div>
                  <Input
                    type="url"
                    value={formData.imagem_url}
                    onChange={(e) => {
                      setFormData({ ...formData, imagem_url: e.target.value })
                      if (e.target.value && !selectedFile) {
                        setImagePreview(e.target.value)
                      }
                    }}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="especificacoes">Especificações Técnicas</Label>
                  <Textarea
                    id="especificacoes"
                    value={formData.especificacoes}
                    onChange={(e) => setFormData({ ...formData, especificacoes: e.target.value })}
                    rows={4}
                    placeholder="Peso: 20 toneladas&#10;Motor: 150HP&#10;Alcance: 9.5m&#10;Capacidade: 1.2m³"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Uma especificação por linha</p>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="disponivel"
                      checked={formData.disponivel}
                      onCheckedChange={(checked) => setFormData({ ...formData, disponivel: checked })}
                    />
                    <Label htmlFor="disponivel">Produto Disponível</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="destaque"
                      checked={formData.destaque}
                      onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
                    />
                    <Label htmlFor="destaque">Produto em Destaque</Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 flex-1">
                    {editingProduct ? "Atualizar Produto" : "Criar Produto"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Produto</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={
                      selectedProduct.imagem_url ||
                      `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(selectedProduct.nome) || "/placeholder.svg"}`
                    }
                    alt={selectedProduct.nome}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedProduct.nome}</h3>
                    <Badge variant="secondary" className="mb-2">
                      {selectedProduct.categoria}
                    </Badge>
                    <p className="text-muted-foreground">{selectedProduct.descricao}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Preços:</Label>
                    <div className="space-y-1 text-sm">
                      <div>Por dia: R$ {selectedProduct.preco_diario.toFixed(2)}</div>
                      {selectedProduct.preco_normal && <div>Normal: R$ {selectedProduct.preco_normal.toFixed(2)}</div>}
                      {selectedProduct.preco_semanal && (
                        <div>Semanal: R$ {selectedProduct.preco_semanal.toFixed(2)}</div>
                      )}
                      {selectedProduct.preco_mensal && <div>Mensal: R$ {selectedProduct.preco_mensal.toFixed(2)}</div>}
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Status:</Label>
                    <div className="space-y-1 text-sm">
                      <div>Disponível: {selectedProduct.disponivel ? "Sim" : "Não"}</div>
                      <div>Destaque: {selectedProduct.destaque ? "Sim" : "Não"}</div>
                    </div>
                  </div>
                </div>

                {selectedProduct.especificacoes && selectedProduct.especificacoes.length > 0 && (
                  <div>
                    <Label className="font-semibold">Especificações:</Label>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      {selectedProduct.especificacoes.map((spec, index) => (
                        <li key={index}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <Card key={produto.id} className="hover-lift smooth-transition">
              <div className="relative">
                <img
                  src={
                    produto.imagem_url ||
                    `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(produto.nome) || "/placeholder.svg"}`
                  }
                  alt={produto.nome}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                {produto.destaque && (
                  <Badge className="absolute top-2 left-2 bg-orange-500">
                    <Star className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
                <Badge className={`absolute top-2 right-2 ${produto.disponivel ? "bg-green-500" : "bg-red-500"}`}>
                  {produto.disponivel ? "Disponível" : "Indisponível"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-12 bg-black/70 hover:bg-black/90 text-white border border-white/20 shadow-lg backdrop-blur-sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDetails(produto)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(produto)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(produto.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{produto.nome}</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {produto.categoria}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center text-lg font-bold text-orange-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      R$ {produto.preco_diario.toFixed(2)}/dia
                    </div>
                    {produto.preco_normal && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Normal: R$ {produto.preco_normal.toFixed(2)}
                      </div>
                    )}
                  </div>
                  {produto.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{produto.descricao}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {produtos.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground mb-4">Comece adicionando produtos ao seu catálogo</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
