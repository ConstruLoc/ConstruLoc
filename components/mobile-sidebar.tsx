"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: "🏠", label: "Dashboard", href: "/" },
  { icon: "📦", label: "Equipamentos", href: "/equipamentos" },
  { icon: "🏷️", label: "Categorias", href: "/categorias" },
  { icon: "👥", label: "Clientes", href: "/clientes" },
  { icon: "📄", label: "Contratos", href: "/contratos" },
  { icon: "💳", label: "Pagamentos", href: "/pagamentos" },
  { icon: "📚", label: "Catálogo", href: "/catalogo" },
  { icon: "📊", label: "Relatórios", href: "/relatorios" },
  { icon: "🧾", label: "Comprovantes", href: "/comprovantes" },
  { icon: "⚙️", label: "Configurações", href: "/configuracoes" },
]

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent smooth-transition"
      >
        <span className="text-lg">☰</span>
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50 animate-fade-in-backdrop" onClick={() => setIsOpen(false)} />

          <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
              <h2 className="text-lg font-semibold text-sidebar-foreground">Menu ConstruLoc</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-sidebar-foreground hover:bg-sidebar-accent smooth-transition"
              >
                <span className="text-lg">✕</span>
              </Button>
            </div>

            <nav className="px-2 py-4 space-y-1">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground smooth-transition hover-lift",
                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="ml-3">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
