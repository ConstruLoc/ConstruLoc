"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Construction,
  Users2,
  ScrollText,
  Banknote,
  TrendingUp,
  Settings2,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  BookOpenCheck,
} from "lucide-react"

const navigationSections = [
  {
    title: "Geral",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    title: "Inventário",
    items: [
      {
        name: "Equipamentos",
        href: "/equipamentos",
        icon: Construction,
      },
      {
        name: "Categorias",
        href: "/categorias",
        icon: FolderTree,
      },
      {
        name: "Catálogo",
        href: "/catalogo",
        icon: BookOpenCheck,
      },
    ],
  },
  {
    title: "Negócios",
    items: [
      {
        name: "Clientes",
        href: "/clientes",
        icon: Users2,
      },
      {
        name: "Contratos",
        href: "/contratos",
        icon: ScrollText,
      },
      {
        name: "Pagamentos",
        href: "/pagamentos",
        icon: Banknote,
      },
    ],
  },
  {
    title: "Análises",
    items: [
      {
        name: "Relatórios",
        href: "/relatorios",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        name: "Configurações",
        href: "/configuracoes",
        icon: Settings2,
      },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300",
        "h-full md:h-full",
        "w-64",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-orange-500">ConstruLoc</h1>
          <p className="text-xs text-gray-400">Locações de Equipamentos</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-8 w-8 p-0 hover:bg-gray-700 text-gray-300"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4" style={{ WebkitOverflowScrolling: "touch" }}>
        <nav className="space-y-6">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-2">
              {/* Section Title */}
              <div className="px-3 py-1 flex items-center gap-2">
                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</h3>
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-10 text-gray-300 hover:bg-gray-700 hover:text-orange-400 transition-all duration-200 group border-l-2 border-transparent hover:border-orange-500",
                          "md:justify-start md:gap-3",
                          collapsed && "md:justify-center md:px-2",
                          isActive && "bg-orange-600 text-white hover:bg-orange-700 border-orange-600 hover:text-white",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                            !isActive && "group-hover:text-orange-400",
                          )}
                        />
                        <span className="truncate md:block">{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Status Card */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0 md:block">
        <div className="bg-gray-700 rounded-lg p-3 border-l-2 border-orange-500">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-300">Sistema Online</span>
          </div>
          <p className="text-xs text-gray-400">Todos os sistemas funcionando normalmente</p>
        </div>
      </div>
    </div>
  )
}
