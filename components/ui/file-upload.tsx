"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  preview?: string
  className?: string
}

export function FileUpload({ onFileSelect, accept = "image/*", maxSize = 5, preview, className }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setError(null)

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${maxSize}MB.`)
      return
    }

    // Check file type
    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      setError("Tipo de arquivo não suportado.")
      return
    }

    onFileSelect(file)
  }

  const handleRemove = () => {
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-orange-500 bg-orange-500/10" : "border-gray-700 hover:border-gray-600 bg-gray-800/50",
          error ? "border-red-500" : "",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {preview ? (
          <div className="relative">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover rounded-md" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-500" />
            <div className="mt-4">
              <Label className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-300">
                  Clique para fazer upload ou arraste uma imagem
                </span>
              </Label>
              <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF até {maxSize}MB</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
