"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Category {
  id: string
  nome: string
  descricao?: string
  icone?: string
  cor?: string
  equipamentos: number
}

interface CategoriesClientProps {
  initialCategories: Category[]
}

const availableIcons = ["🚜", "🚛", "🏗️", "🔨", "⚡", "🔧", "⚙️", "🛠️", "📦", "🏭", "⛏️", "🪛"]
const availableColors = [
  { name: "Azul", value: "bg-blue-500" },
  { name: "Verde", value: "bg-green-500" },
  { name: "Laranja", value: "bg-orange-500" },
  { name: "Roxo", value: "bg-purple-500" },
  { name: "Vermelho", value: "bg-red-500" },
  { name: "Amarelo", value: "bg-yellow-500" },
  { name: "Rosa", value: "bg-pink-500" },
  { name: "Índigo", value: "bg-indigo-500" },
  { name: "Ciano", value: "bg-cyan-500" },
  { name: "Esmeralda", value: "bg-emerald-500" },
]

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState(initialCategories)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    icone: "📦",
    cor: "bg-blue-500",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean
    categoryId: string | null
    categoryName: string
    equipmentCount: number
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: "",
    equipmentCount: 0,
  })
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    type: "success" | "error" | "info"
    title: string
    message: string
    scriptName?: string
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  })
  const router = useRouter()
  const supabase = createClient()

  const filteredCategorias = categories.filter((categoria) =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        nome: category.nome,
        descricao: category.descricao || "",
        icone: category.icone || "📦",
        cor: category.cor || "bg-blue-500",
      })
    } else {
      setEditingCategory(null)
      setFormData({ nome: "", descricao: "", icone: "📦", cor: "bg-blue-500" })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setFormData({ nome: "", descricao: "", icone: "📦", cor: "bg-blue-500" })
  }

  const refreshCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias_equipamentos")
        .select("*, equipamentos:equipamentos(count)")
        .order("nome")

      if (error) throw error

      const formattedCategories = data.map((cat: any) => ({
        id: cat.id,
        nome: cat.nome,
        descricao: cat.descricao,
        icone: cat.icone,
        cor: cat.cor,
        equipamentos: cat.equipamentos?.[0]?.count || 0,
      }))

      setCategories(formattedCategories)
    } catch (error) {
      console.error("Error refreshing categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categorias_equipamentos")
          .update({
            nome: formData.nome,
            descricao: formData.descricao,
            icone: formData.icone,
            cor: formData.cor,
          })
          .eq("id", editingCategory.id)

        if (error) {
          if (error.code === "42703") {
            const { error: fallbackError } = await supabase
              .from("categorias_equipamentos")
              .update({
                nome: formData.nome,
                descricao: formData.descricao,
              })
              .eq("id", editingCategory.id)

            if (fallbackError) throw fallbackError
            showAlert(
              "info",
              "Categoria atualizada!",
              "A categoria foi atualizada com sucesso. Para habilitar ícones e cores personalizados, execute o script de migração.",
              "007_add_icon_color_to_categories.sql",
            )
          } else if (error.code === "42501") {
            throw new Error("RLS_POLICY_ERROR")
          } else {
            throw error
          }
        } else {
          showAlert("success", "Sucesso!", "Categoria atualizada com sucesso.")
        }
      } else {
        const { error } = await supabase.from("categorias_equipamentos").insert([
          {
            nome: formData.nome,
            descricao: formData.descricao,
            icone: formData.icone,
            cor: formData.cor,
          },
        ])

        if (error) {
          if (error.code === "42703") {
            const { error: fallbackError } = await supabase.from("categorias_equipamentos").insert([
              {
                nome: formData.nome,
                descricao: formData.descricao,
              },
            ])

            if (fallbackError) throw fallbackError
            showAlert(
              "info",
              "Categoria criada!",
              "A categoria foi criada com sucesso. Para habilitar ícones e cores personalizados, execute o script de migração.",
              "007_add_icon_color_to_categories.sql",
            )
          } else if (error.code === "42501") {
            throw new Error("RLS_POLICY_ERROR")
          } else {
            throw error
          }
        } else {
          showAlert("success", "Sucesso!", "Categoria criada com sucesso.")
        }
      }

      handleCloseDialog()
      await refreshCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      if (error instanceof Error && error.message === "RLS_POLICY_ERROR") {
        showAlert(
          "error",
          "Permissão Negada",
          "Não foi possível salvar a categoria devido às políticas de segurança do banco de dados. Execute o script de migração para configurar as permissões necessárias.",
          "009_fix_categories_rls.sql",
        )
      } else {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        showAlert("error", "Erro ao Salvar", `Ocorreu um erro ao salvar a categoria: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (category: Category) => {
    console.log("[v0] Delete button clicked for category:", category.nome, "with", category.equipamentos, "equipment")

    setDeleteConfirmState({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.nome,
      equipmentCount: category.equipamentos,
    })
  }

  const handleDelete = async () => {
    const { categoryId, categoryName, equipmentCount } = deleteConfirmState

    if (!categoryId) return

    try {
      if (equipmentCount > 0) {
        console.log(`[v0] Deleting ${equipmentCount} equipment items for category ${categoryName}`)
        const { error: equipmentError } = await supabase.from("equipamentos").delete().eq("categoria_id", categoryId)

        if (equipmentError) {
          console.error("[v0] Error deleting equipment:", equipmentError)
          throw equipmentError
        }
      }

      const { error } = await supabase.from("categorias_equipamentos").delete().eq("id", categoryId)

      if (error) {
        if (error.code === "42501") {
          throw new Error("RLS_POLICY_ERROR")
        }
        throw error
      }

      setDeleteConfirmState({ isOpen: false, categoryId: null, categoryName: "", equipmentCount: 0 })

      const successMessage =
        equipmentCount > 0
          ? `A categoria "${categoryName}" e ${equipmentCount} equipamento(s) foram excluídos com sucesso.`
          : `A categoria "${categoryName}" foi excluída com sucesso.`

      showAlert("success", "Categoria excluída!", successMessage)
      await refreshCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      setDeleteConfirmState({ isOpen: false, categoryId: null, categoryName: "", equipmentCount: 0 })

      if (error instanceof Error && error.message === "RLS_POLICY_ERROR") {
        showAlert(
          "error",
          "Permissão Negada",
          "Não foi possível excluir a categoria devido às políticas de segurança do banco de dados. Execute o script de migração para configurar as permissões necessárias.",
          "009_fix_categories_rls.sql",
        )
      } else {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        showAlert("error", "Erro ao Excluir", `Ocorreu um erro ao excluir a categoria: ${errorMessage}`)
      }
    }
  }

  const showAlert = (type: "success" | "error" | "info", title: string, message: string, scriptName?: string) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      message,
      scriptName,
    })
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <span className="text-orange-500">🏷️</span>
              Categorias
            </h1>
            <p className="text-muted-foreground">Gerencie as categorias dos equipamentos</p>
            <div className="h-1 w-20 bg-orange-500 rounded-full mt-2"></div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="icon-hover bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>

        {filteredCategorias.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
            <Button onClick={() => handleOpenDialog()} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira categoria
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategorias.map((categoria, index) => (
              <Card
                key={categoria.id}
                className="hover-lift smooth-transition animate-fade-in-up border-l-4 border-l-orange-500"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{categoria.icone || "📦"}</span>
                      <div
                        className={cn("w-4 h-4 rounded-full animate-float", categoria.cor || "bg-blue-500")}
                        style={{ animationDelay: `${index * 0.3}s` }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="icon-hover text-orange-400 hover:text-orange-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("[v0] Edit button clicked for category:", categoria.nome)
                          handleOpenDialog(categoria)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="icon-hover text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(categoria)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{categoria.nome}</CardTitle>
                  {categoria.descricao && <p className="text-sm text-muted-foreground">{categoria.descricao}</p>}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="icon-pulse border border-orange-500/30">
                      {categoria.equipamentos} equipamentos
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Atualize as informações da categoria"
                  : "Adicione uma nova categoria de equipamentos"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              {/* Nome e Descrição */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Categoria *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Betoneiras"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição da categoria..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Icon Selection */}
              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="grid grid-cols-6 gap-2">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icone: icon })}
                      className={cn(
                        "p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110",
                        formData.icone === icon
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor: color.value })}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all hover:scale-105 flex flex-col items-center gap-2",
                        formData.cor === color.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-full", color.value)} />
                      <span className="text-xs text-muted-foreground">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Pré-visualização</Label>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{formData.icone}</span>
                    <div className={cn("w-6 h-6 rounded-full", formData.cor)} />
                    <div>
                      <p className="font-semibold">{formData.nome || "Nome da categoria"}</p>
                      <p className="text-sm text-muted-foreground">{formData.descricao || "Descrição da categoria"}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : editingCategory ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modern Alert Dialog Component */}
      <AlertDialog
        open={deleteConfirmState.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteConfirmState({ isOpen: false, categoryId: null, categoryName: "", equipmentCount: 0 })
        }
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl">Excluir Categoria</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base text-foreground/80">
              {deleteConfirmState.equipmentCount > 0 ? (
                <>
                  A categoria <span className="font-semibold text-foreground">"{deleteConfirmState.categoryName}"</span>{" "}
                  possui{" "}
                  <span className="font-semibold text-foreground">
                    {deleteConfirmState.equipmentCount} equipamento(s)
                  </span>{" "}
                  associado(s).
                  <br />
                  <br />
                  <span className="font-semibold text-red-500">
                    Ao excluir esta categoria, todos os equipamentos associados também serão excluídos permanentemente.
                  </span>
                  <br />
                  <br />
                  Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir a categoria{" "}
                  <span className="font-semibold text-foreground">"{deleteConfirmState.categoryName}"</span>?
                  <br />
                  <br />
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir Categoria
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modern Alert Dialog Component */}
      <AlertDialog open={alertState.isOpen} onOpenChange={(open) => setAlertState({ ...alertState, isOpen: open })}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {alertState.type === "success" && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              )}
              {alertState.type === "error" && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              )}
              {alertState.type === "info" && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                  <Info className="h-6 w-6 text-blue-500" />
                </div>
              )}
              <div className="flex-1">
                <AlertDialogTitle className="text-xl">{alertState.title}</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base text-foreground/80">
              {alertState.message}
            </AlertDialogDescription>
            {alertState.scriptName && (
              <div className="mt-4 rounded-lg bg-muted p-4 border border-border">
                <p className="text-sm font-medium mb-2 text-foreground">Script necessário:</p>
                <code className="text-sm bg-background px-3 py-1.5 rounded border border-border block font-mono text-primary">
                  {alertState.scriptName}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Execute este script na aba de configurações do projeto para habilitar esta funcionalidade.
                </p>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className={cn(
                alertState.type === "success" && "bg-green-500 hover:bg-green-600",
                alertState.type === "error" && "bg-red-500 hover:bg-red-600",
                alertState.type === "info" && "bg-blue-500 hover:bg-blue-600",
              )}
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
