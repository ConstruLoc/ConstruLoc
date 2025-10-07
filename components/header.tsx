"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { NotificationsPanel } from "@/components/notifications-panel"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Settings, User, LogOut } from "lucide-react"
import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { useUser } from "@/contexts/user-context"

interface HeaderProps {
  showBackButton?: boolean
  title?: string
}

export function Header({ showBackButton = false, title }: HeaderProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const { profile, user } = useUser()

  const handleLogout = async () => {
    try {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      })

      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.back()
  }

  const getInitials = () => {
    if (profile?.nome) {
      return profile.nome
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  const getDisplayName = () => {
    return profile?.nome || user?.email || "Usuário"
  }

  const getDisplayEmail = () => {
    return profile?.email || user?.email || ""
  }

  return (
    <header
      className={`${theme === "dark" ? "bg-[#1f1f1f] border-gray-700" : "bg-white border-gray-200"} border-b px-4 md:px-6 py-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MobileSidebar />

          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className={`${theme === "dark" ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"}`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center space-x-3">
            <Image
              src="/images/logo-construloc-sem-fundo.png"
              alt="ConstruLoc"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          <div className="hidden lg:block">
            <h1 className="text-orange-500 text-lg font-semibold">{title || "Sistema de Gerenciamento"}</h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Locações de equipamentos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <NotificationsPanel />

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${theme === "dark" ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"} relative`}
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={`w-56 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <div className="px-3 py-2">
                <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {getDisplayName()}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{getDisplayEmail()}</p>
              </div>
              <DropdownMenuSeparator className={theme === "dark" ? "bg-gray-700" : "bg-gray-200"} />
              <DropdownMenuItem
                className={`${theme === "dark" ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"} cursor-pointer`}
                onClick={() => router.push("/configuracoes")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`${theme === "dark" ? "text-white hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"} cursor-pointer`}
                onClick={() => router.push("/perfil")}
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className={theme === "dark" ? "bg-gray-700" : "bg-gray-200"} />
              <DropdownMenuItem
                onClick={handleLogout}
                className={`${theme === "dark" ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-100"} cursor-pointer`}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
