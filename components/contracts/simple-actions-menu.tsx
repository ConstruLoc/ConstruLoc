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
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!buttonRef.current) return

        const rect = buttonRef.current.getBoundingClientRect()
        const menuWidth = 192 // w-48 = 12rem = 192px
        const menuHeight = contractStatus !== "cancelado" ? 240 : 200

        console.log("[v0] Button rect:", rect)
        console.log("[v0] Window dimensions:", { width: window.innerWidth, height: window.innerHeight })

        // Verificar se as coordenadas são válidas
        if (rect.top === 0 && rect.left === 0 && rect.width === 0 && rect.height === 0) {
          console.error("[v0] Invalid button rect, using fallback position")
          // Fallback: posicionar no centro da tela
          setPosition({
            top: window.innerHeight / 2 - menuHeight / 2,
            left: window.innerWidth / 2 - menuWidth / 2,
          })
          return
        }

        // Calculate position - menu appears below and aligned to the right of the button
        let top = rect.bottom + 8 // 8px gap below button
        let left = rect.right - menuWidth // Align right edge of menu with right edge of button

        console.log("[v0] Initial calculated position:", { top, left })

        // Adjust if menu goes off screen horizontally
        if (left < 8) {
          left = 8
          console.log("[v0] Adjusted left to prevent off-screen:", left)
        }
        if (left + menuWidth > window.innerWidth - 8) {
          left = window.innerWidth - menuWidth - 8
          console.log("[v0] Adjusted left to fit in viewport:", left)
        }

        // Adjust if menu goes off screen vertically
        if (top + menuHeight > window.innerHeight - 8) {
          top = rect.top - menuHeight - 8 // Position above button instead
          console.log("[v0] Adjusted top to position above button:", top)
        }

        // Final safety check
        if (top < 8) top = 8
        if (left < 8) left = 8

        console.log("[v0] Final menu position:", { top, left })
        setPosition({ top, left })
      })
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
    console.log("[v0] Menu toggle clicked for contract:", contractNumber)
    console.log("[v0] Current isOpen state:", isOpen)
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
