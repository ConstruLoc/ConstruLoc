"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Eye, Edit, Download, Anvil as Cancel, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimpleActionsMenuProps {
  contractId: string
  contractNumber: string
  contractStatus: string
  onViewDetails: () => void
  onEdit: () => void
  onDownloadPDF: () => void
  onCancel: () => void
  onDelete: () => void
}

export function SimpleActionsMenu({
  contractId,
  contractNumber,
  contractStatus,
  onViewDetails,
  onEdit,
  onDownloadPDF,
  onCancel,
  onDelete,
}: SimpleActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 192 // w-48 = 12rem = 192px
      const menuHeight = contractStatus !== "cancelado" ? 240 : 200 // Approximate height

      // Calculate position
      let top = rect.bottom + 4
      let left = rect.right - menuWidth

      // Adjust if menu goes off screen
      if (left < 8) left = 8
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4
      }

      setPosition({ top, left })

      console.log("[v0] Menu opened at position:", { top, left })
    }
  }, [isOpen, contractStatus])

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

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Menu toggle clicked, current state:", isOpen)
    setIsOpen(!isOpen)
  }

  const handleAction = (action: () => void) => {
    console.log("[v0] Menu action clicked")
    setIsOpen(false)
    action()
  }

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
        onClick={handleToggle}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-[9999] w-48 rounded-md border border-slate-700 bg-slate-800 shadow-lg"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="p-1">
            <button
              onClick={() => handleAction(onViewDetails)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Ver detalhes
            </button>
            <button
              onClick={() => handleAction(onEdit)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => handleAction(onDownloadPDF)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </button>
            {contractStatus !== "cancelado" && (
              <>
                <div className="my-1 h-px bg-slate-700" />
                <button
                  onClick={() => handleAction(onCancel)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-yellow-400 hover:bg-slate-700 transition-colors"
                >
                  <Cancel className="h-4 w-4" />
                  Cancelar
                </button>
              </>
            )}
            <div className="my-1 h-px bg-slate-700" />
            <button
              onClick={() => handleAction(onDelete)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        </div>
      )}
    </>
  )
}
