"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Download, XCircle, Trash2, MoreVertical } from "lucide-react"

interface CustomActionsMenuProps {
  contractId: string
  contractNumber: string
  contractStatus: string
  onViewDetails: () => void
  onEdit: () => void
  onDownloadPDF: () => void
  onCancel: () => void
  onDelete: () => void
}

export function CustomActionsMenu({
  contractId,
  contractNumber,
  contractStatus,
  onViewDetails,
  onEdit,
  onDownloadPDF,
  onCancel,
  onDelete,
}: CustomActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleAction = (action: () => void) => {
    setIsOpen(false)
    action()
  }

  return (
    <div className="relative inline-block">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="h-8 w-8 p-0 hover:bg-gray-700"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-[99999] animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              onClick={() => handleAction(onViewDetails)}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Ver detalhes
            </button>
            <button
              onClick={() => handleAction(onEdit)}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => handleAction(onDownloadPDF)}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </button>
            {contractStatus !== "cancelado" && contractStatus !== "finalizado" && (
              <>
                <div className="h-px bg-gray-700 my-1" />
                <button
                  onClick={() => handleAction(onCancel)}
                  className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </button>
              </>
            )}
            <div className="h-px bg-gray-700 my-1" />
            <button
              onClick={() => handleAction(onDelete)}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
