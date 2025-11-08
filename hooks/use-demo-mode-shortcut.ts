"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useDemoModeShortcut() {
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detecta Ctrl + Shift + D (ou Cmd + Shift + D no Mac)
      const isCtrlOrCmd = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey
      const isDKey = event.key.toLowerCase() === "d"

      console.log("[v0] Key pressed:", {
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        isCtrlOrCmd,
        isShift,
        isDKey,
      })

      if (isCtrlOrCmd && isShift && isDKey) {
        event.preventDefault()
        console.log("[v0] Demo mode shortcut detected!")

        // Alterna o modo demonstração
        const currentMode = localStorage.getItem("demo_mode") === "true"
        const newMode = !currentMode

        localStorage.setItem("demo_mode", newMode ? "true" : "false")
        console.log("[v0] Demo mode toggled:", newMode)

        // Mostra toast discreto
        toast({
          title: newMode ? "Modo Demo Ativado" : "Modo Demo Desativado",
          description: newMode
            ? "Dados sensíveis ocultados. Pressione Ctrl+Shift+D para desativar."
            : "Dados reais exibidos normalmente.",
          duration: 3000,
        })

        // Recarrega a página para aplicar as mudanças
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }

    console.log("[v0] Demo mode shortcut listener registered")
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      console.log("[v0] Demo mode shortcut listener removed")
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [toast])
}
