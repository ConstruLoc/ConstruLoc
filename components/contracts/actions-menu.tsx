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
      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 192 // w-48 = 12rem = 192px
      const menuHeight = 200 // Approximate height

      // Calculate position
      let top = rect.bottom + 4 // 4px spacing
      let left = rect.right - menuWidth // Align right edge with button

      // Adjust if menu goes off screen
      if (left < 8) left = 8 // Min 8px from left edge
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8
      }

      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - 4 // Show above button if no space below
      }

      setMenuPosition({ top, left })
    }
  }, [isOpen])

  // Close menu when clicking outside
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
    setIsOpen(!isOpen)
    console.log("[v0] ActionsMenu toggled:", !isOpen, "for contract:", contractNumber)
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
