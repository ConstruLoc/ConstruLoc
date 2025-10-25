"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import ActionsModal from "../actionsModal"

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
        const menuWidth = 192 // w-48 = 12rem = 192px
        const menuHeight = 240 // Approximate height with all options

        let top = rect.bottom + 4 // 4px spacing below button
        let left = rect.right - menuWidth // Align right edge of menu with right edge of button

        // Ensure menu doesn't go off screen
        if (left < 8) {
          left = 8 // Min 8px from left edge
        }
        if (left + menuWidth > window.innerWidth - 8) {
          left = window.innerWidth - menuWidth - 8
        }

        if (top + menuHeight > window.innerHeight - 8) {
          top = rect.top - menuHeight - 4 // Show above button if no space below
        }
        if (top < 8) {
          top = 8 // Min 8px from top edge
        }

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

  const handleOk = () => {
    setIsOpen(false)
  }

  const handleCancel = () => {
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
        <ActionsModal isOpen={isOpen} menuRef={menuRef} menuPosition={menuPosition} contractId={contractId} contractStatus={contractStatus} onDelete={onDelete} onCancel={onCancel} onDownloadPDF={onDownloadPDF} setIsOpen={setIsOpen} handleOk={handleOk} handleCancel={handleCancel} handleAction={handleAction} />
      )}
    </div>
  )
}
