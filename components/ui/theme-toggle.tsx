"use client"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative text-white hover:bg-gray-700 transition-all duration-300"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
