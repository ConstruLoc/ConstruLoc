"use client"

import type React from "react"

import { useState } from "react"
import { Camera, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"

interface ContractPhotoUploadProps {
  currentPhoto?: string | null
  onPhotoChange: (photo: string | null) => void
  disabled?: boolean
}

export function ContractPhotoUpload({ currentPhoto, onPhotoChange, disabled = false }: ContractPhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null)
  const [showFullImage, setShowFullImage] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setPreview(base64String)
      onPhotoChange(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onPhotoChange(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-orange-500" />
        <label className="text-sm font-medium text-gray-200">Foto do Contrato (Opcional)</label>
      </div>

      {preview ? (
        <Card className="relative p-4 bg-gray-800 border-gray-700">
          <div className="relative w-full h-48 mb-3">
            <Image src={preview || "/placeholder.svg"} alt="Foto do contrato" fill className="object-contain rounded" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowFullImage(true)} className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Ver Completa
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="flex-1 text-red-500 hover:text-red-400 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Remover
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
            id="contract-photo-input"
          />
          <label
            htmlFor="contract-photo-input"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              disabled
                ? "border-gray-700 bg-gray-800 cursor-not-allowed"
                : "border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-orange-500"
            }`}
          >
            <Camera className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">Clique para tirar foto ou selecionar imagem</span>
            <span className="text-xs text-gray-500 mt-1">Máximo 5MB - JPG, PNG</span>
          </label>
        </div>
      )}

      {/* Full Image Modal */}
      {showFullImage && preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-transparent"
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
    </div>
  )
}
