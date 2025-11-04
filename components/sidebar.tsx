"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Users,
  FileText,
  CreditCard,
  BookOpen,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react"

const menuSections = [
  {
    title: "Geral",
    items: [{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", gradient: "from-blue-500 to-blue-600" }],
  },
  {
    title: "Inventário",
    items: [
      { icon: Package, label: "Equipamentos", href: "/equipamentos", gradient: "from-orange-500 to-orange-600" },
      { icon: FolderOpen, label: "Categorias", href: "/categorias", gradient: "from-purple-500 to-purple-600" },
      { icon: BookOpen, label: "Catálogo", href: "/catalogo", gradient: "from-pink-500 to-pink-600" },
    ],
  },
  {
    title: "Negócios",
    items: [
      { icon: Users, label: "Clientes", href: "/clientes", gradient: "from-green-500 to-green-600" },
      { icon: FileText, label: "Contratos", href: "/contratos", gradient: "from-blue-500 to-indigo-600" },
      { icon: CreditCard, label: "Pagamentos", href: "/pagamentos", gradient: "from-emerald-500 to-emerald-600" },
    ],
  },
  {
    title: "Análises",
    items: [
      { icon: TrendingUp, label: "Relatórios", href: "/relatorios", gradient: "from-yellow-500 to-yellow-600" },
      { icon: Receipt, label: "Comprovantes", href: "/comprovantes", gradient: "from-cyan-500 to-cyan-600" },
    ],
  },
  {
    title: "Sistema",
    items: [{ icon: Settings, label: "Configurações", href: "/configuracoes", gradient: "from-gray-500 to-gray-600" }],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "hidden md:block bg-sidebar border-r border-sidebar-border transition-all duration-300 animate-slide-in-left",
        collapsed ? "w-20" : "w-80",
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <div className="flex items-center space-x-3 animate-fade-in">
              <Image src="/construloc-logo.png" alt="ConstruLoc" width={120} height={40} className="h-10 w-auto" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <nav className="px-4 space-y-6">
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className="space-y-2">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item, index) => {
                const isActive = pathname === item.href
                const IconComponent = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 group animate-fade-in-up h-12",
                        collapsed && "px-3 justify-center",
                        !collapsed && "px-4",
                        isActive && "bg-gradient-to-r text-white shadow-lg",
                        isActive && item.gradient,
                      )}
                      style={{ animationDelay: `${(sectionIndex * 3 + index) * 0.05}s` }}
                    >
                      <IconComponent
                        className={cn(
                          "w-5 h-5 transition-all duration-200",
                          "group-hover:scale-110",
                          isActive && "animate-pulse",
                        )}
                      />
                      {!collapsed && (
                        <span className="ml-4 font-medium text-base transition-all duration-200">{item.label}</span>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-6 left-6 right-6 animate-fade-in">
          <div className="bg-sidebar-accent rounded-lg p-4 border border-sidebar-border">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-sidebar-foreground">Sistema Online</span>
            </div>
            <p className="text-xs text-muted-foreground">Todos os sistemas funcionando normalmente</p>
          </div>
        </div>
      )}
    </div>
  )
}
