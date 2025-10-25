"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Eye, Trash2, Download, XCircle } from "lucide-react"
import Link from "next/link"

interface ActionsMenuProps {
  contractId: string
  contractNumber: string
  contractStatus: string
  onDelete: () => void
  onCancel: () => void
  onDownloadPDF: () => void
}

export function ActionsMenu({
  contractId,
  contractNumber,
  contractStatus,
  onDelete,
  onCancel,
  onDownloadPDF,
}: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      requestAnimationFrame(() => {
        if (!buttonRef.current) return

        const rect = buttonRef.current.getBoundingClientRect()
        console.log("[v0] Button rect:", {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        })
        console.log("[v0] Window size:", {
          width: window.innerWidth,
          height: window.innerHeight,
        })

        const menuWidth = 192 // w-48 = 12rem = 192px
        const menuHeight = 240 // Approximate height with all options

        let top = rect.bottom + 4 // 4px spacing below button
        let left = rect.right - menuWidth // Align right edge of menu with right edge of button

        console.log("[v0] Initial position:", { top, left })

        if (left < 8) {
          left = 8 // Min 8px from left edge
          console.log("[v0] Adjusted left (too far left):", left)
        }
        if (left + menuWidth > window.innerWidth - 8) {
          left = window.innerWidth - menuWidth - 8
          console.log("[v0] Adjusted left (too far right):", left)
        }

        if (top + menuHeight > window.innerHeight - 8) {
          top = rect.top - menuHeight - 4 // Show above button if no space below
          console.log("[v0] Adjusted top (show above):", top)
        }

        console.log("[v0] Final position:", { top, left })
        setMenuPosition({ top, left })
      })
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside as any)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside as any)
    }
  }, [isOpen])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] ActionsMenu toggled:", !isOpen, "for contract:", contractNumber)
    setIsOpen(!isOpen)
  }

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
        onClick={handleToggle}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-[9999] py-1"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <Link
            href={`/contratos/${contractId}`}
            className="flex items-center px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </Link>

          <Link
            href={`/contratos/${contractId}/editar`}
            className="flex items-center px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>

          <button
            onClick={() => handleAction(onDownloadPDF)}
            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </button>

          {contractStatus !== "cancelado" && contractStatus !== "finalizado" && (
            <button
              onClick={() => handleAction(onCancel)}
              className="w-full flex items-center px-3 py-2 text-sm text-yellow-400 hover:bg-slate-700 cursor-pointer"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </button>
          )}

          <button
            onClick={() => handleAction(onDelete)}
            className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-slate-700 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </button>
        </div>
      )}
    </div>
  )
}
