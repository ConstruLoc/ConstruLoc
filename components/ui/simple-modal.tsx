"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  icon?: React.ReactNode
  maxWidth?: string
}

export function SimpleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  icon,
  maxWidth = "max-w-md",
}: SimpleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-slate-900 border border-slate-700 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {icon && <div className="flex h-12 w-12 items-center justify-center rounded-full">{icon}</div>}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

interface SimpleAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  icon?: React.ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: "default" | "destructive" | "success"
}

export function SimpleAlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  icon,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "default",
}: SimpleAlertModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case "destructive":
        return "bg-red-500 hover:bg-red-600"
      case "success":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-orange-500 hover:bg-orange-600"
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {icon && <div className="flex h-12 w-12 items-center justify-center rounded-full">{icon}</div>}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            </div>
          </div>

          <p className="text-base text-foreground/80 mb-6">{description}</p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="bg-transparent">
              {cancelText}
            </Button>
            <Button onClick={onConfirm} className={getConfirmButtonClass()}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
