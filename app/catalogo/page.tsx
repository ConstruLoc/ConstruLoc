"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AddProductForm } from "@/components/catalogo/add-product-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, DollarSign, Tag, Loader2, Plus, Edit, Trash2, Eye } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Produto {
  id: string
  nome: string
  descricao: string
  categoria: string
  preco_normal: number
  preco_diario: number
  imagem_url?: string
  especificacoes?: string[]
  disponivel: boolean
  destaque: boolean
}

export default function CatalogoPage() {
  const { toast } = useToast()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)

  const fetchProdutos = async () => {
    try {
      console.log("[v0] Buscando produtos do catálogo...")
      const response = await fetch("/api/catalogo")
      const data = await response.json()
      console.log("[v0] Produtos recebidos:", data.produtos)
      setProdutos(data.produtos || [])
    } catch (error) {
      console.error("[v0] Erro ao buscar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/catalogo?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar produto")
      }

      toast({
        title: "Produto removido!",
        description: "O produto foi removido do catálogo com sucesso.",
      })

      fetchProdutos()
    } catch (error) {
      console.error("[v0] Erro ao deletar produto:", error)
      toast({
        title: "Erro",
        description: "Erro ao remover produto do catálogo",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProdutoToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setProdutoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleViewDetails = (produto: Produto) => {
    setSelectedProduto(produto)
    setDetailsDialogOpen(true)
  }

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto)
    setShowForm(true)
  }

  return (
    <MainLayout showBackButton={true} title="Catálogo de Produtos">
      <div className="space-y-6">
        {showForm ? (
          <AddProductForm
            editingProduct={editingProduto}
            onSuccess={() => {
              fetchProdutos()
              setShowForm(false)
              setEditingProduto(null)
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingProduto(null)
            }}
          />
        ) : (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-orange-500" />
              Produtos no Catálogo
            </h2>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
        )}

        {/* Lista de Produtos */}
        {!showForm && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : produtos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum produto cadastrado ainda. Clique em "Adicionar Produto" para começar!
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {produtos.map((produto) => (
                  <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {produto.imagem_url && (
                      <div className="h-48 bg-slate-200 overflow-hidden">
                        <img
                          src={produto.imagem_url || "/placeholder.svg"}
                          alt={produto.nome || "Produto"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{produto.nome || "Sem nome"}</CardTitle>
                        {produto.destaque && <Badge className="bg-orange-500">Destaque</Badge>}
                      </div>
                      {produto.categoria && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {produto.categoria}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {produto.descricao && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{produto.descricao}</p>
                      )}

                      <div className="space-y-1">
                        {produto.preco_normal != null && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>Preço Normal: R$ {produto.preco_normal.toFixed(2)}</span>
                          </div>
                        )}
                        {produto.preco_diario != null && (
                          <div className="flex items-center gap-2 text-lg font-bold text-orange-500">
                            <DollarSign className="h-5 w-5" />
                            R$ {produto.preco_diario.toFixed(2)}/dia
                          </div>
                        )}
                      </div>

                      {produto.especificacoes && produto.especificacoes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {produto.especificacoes.slice(0, 3).map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Badge variant={produto.disponivel ? "default" : "secondary"}>
                        {produto.disponivel ? "Disponível" : "Indisponível"}
                      </Badge>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleViewDetails(produto)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleEdit(produto)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => confirmDelete(produto.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => produtoToDelete && handleDelete(produtoToDelete)}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedProduto?.nome || "Detalhes do Produto"}</DialogTitle>
              <DialogDescription>Informações completas do produto</DialogDescription>
            </DialogHeader>
            {selectedProduto && (
              <div className="space-y-4">
                {selectedProduto.imagem_url && (
                  <div className="w-full h-64 bg-slate-200 rounded-lg overflow-hidden">
                    <img
                      src={selectedProduto.imagem_url || "/placeholder.svg"}
                      alt={selectedProduto.nome || "Produto"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Categoria</p>
                    <p className="text-lg">{selectedProduto.categoria || "Não informada"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Status</p>
                    <Badge variant={selectedProduto.disponivel ? "default" : "secondary"}>
                      {selectedProduto.disponivel ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                </div>

                {selectedProduto.descricao && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Descrição</p>
                    <p className="text-base">{selectedProduto.descricao}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedProduto.preco_normal != null && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Preço Normal</p>
                      <p className="text-xl font-bold text-orange-500">R$ {selectedProduto.preco_normal.toFixed(2)}</p>
                    </div>
                  )}
                  {selectedProduto.preco_diario != null && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Preço Diário</p>
                      <p className="text-xl font-bold text-orange-500">
                        R$ {selectedProduto.preco_diario.toFixed(2)}/dia
                      </p>
                    </div>
                  )}
                </div>

                {selectedProduto.especificacoes && selectedProduto.especificacoes.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Especificações</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduto.especificacoes.map((spec, idx) => (
                        <Badge key={idx} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduto.destaque && <Badge className="bg-orange-500">Produto em Destaque</Badge>}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
