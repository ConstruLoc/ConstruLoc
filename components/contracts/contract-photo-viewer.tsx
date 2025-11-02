"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Edit2, Eye, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ContractPhotoViewerProps {
  contractId: string
  currentPhoto?: string | null
  onPhotoUpdate: (photo: string | null) => Promise<{ success: boolean; error?: string }>
}

export function ContractPhotoViewer({ contractId, currentPhoto, onPhotoUpdate }: ContractPhotoViewerProps) {
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(currentPhoto || null)
  const [showFullImage, setShowFullImage] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida")
      return
    }

    setIsLoading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      setPreview(base64String)

      // Salvar no banco de dados
      const result = await onPhotoUpdate(base64String)
      if (result.success) {
        setIsEditing(false)
        router.refresh()
      } else {
        alert("Erro ao salvar foto: " + result.error)
      }
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = async () => {
    if (!confirm("Tem certeza que deseja remover a foto do contrato?")) return

    setIsLoading(true)
    const result = await onPhotoUpdate(null)
    if (result.success) {
      setPreview(null)
      setIsEditing(false)
      router.refresh()
    } else {
      alert("Erro ao remover foto: " + result.error)
    }
    setIsLoading(false)
  }

  // Se não houver foto e não estiver editando, não mostrar nada
  if (!preview && !isEditing) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-orange-500 rounded" />
            <h2 className="text-lg font-semibold text-white">Foto do Contrato</h2>
          </div>
        </div>
        <div className="text-center py-8">
          <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">Nenhuma foto anexada</p>
          <Button onClick={() => setIsEditing(true)} className="bg-orange-600 hover:bg-orange-700">
            <Upload className="w-4 h-4 mr-2" />
            Adicionar Foto
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-12 bg-orange-500 rounded" />
          <h2 className="text-lg font-semibold text-white">Foto do Contrato</h2>
        </div>
        {preview && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="text-orange-500 border-orange-500 hover:bg-orange-500/10"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Foto
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {preview && (
            <div className="relative w-full h-64 mb-4">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Foto do contrato"
                fill
                className="object-contain rounded"
              />
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
                id="contract-photo-edit-input"
              />
              <label
                htmlFor="contract-photo-edit-input"
                className={`flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isLoading
                    ? "border-slate-700 bg-slate-800 cursor-not-allowed"
                    : "border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-orange-500"
                }`}
              >
                <Upload className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-sm text-slate-400">{preview ? "Substituir Foto" : "Adicionar Foto"}</span>
              </label>
            </div>

            {preview && (
              <Button
                onClick={handleRemove}
                disabled={isLoading}
                variant="outline"
                className="text-red-500 hover:text-red-400 border-red-500 hover:bg-red-500/10 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Remover
              </Button>
            )}

            <Button onClick={() => setIsEditing(false)} disabled={isLoading} variant="outline">
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        preview && (
          <div className="space-y-4">
            <div className="relative w-full h-64">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Foto do contrato"
                fill
                className="object-contain rounded"
              />
            </div>
            <Button onClick={() => setShowFullImage(true)} variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Ver em Tela Cheia
            </Button>
          </div>
        )
      )}

      {/* Full Image Modal */}
      {showFullImage && preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-slate-800 hover:bg-slate-700"
              onClick={() => setShowFullImage(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="relative w-full h-full">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Foto do contrato completa"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
