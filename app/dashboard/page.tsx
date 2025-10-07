import { MainLayout } from "@/components/layout/main-layout"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentRentals } from "@/components/recent-rentals"
import { DashboardAlerts } from "@/components/dashboard-alerts"
import { DashboardClient } from "@/components/dashboard-client"
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react"

export default async function DashboardPage() {
  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gray-800 border border-gray-700 shadow-sm rounded-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Bem-vindo ao ConstruLoc
                <span className="text-orange-500">🏗️</span>
              </h1>
              <p className="text-gray-300 mt-2">Gerencie seus equipamentos e contratos de forma eficiente</p>
              <div className="h-1 w-24 bg-orange-500 rounded-full mt-3"></div>
            </div>
            <DashboardClient />
          </div>
        </div>

        {/* Stats Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">Visão Geral</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent"></div>
          </div>
          <DashboardStats />
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Atividade Recente</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent"></div>
            </div>
            <RecentRentals />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Alertas e Notificações</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent"></div>
            </div>
            <DashboardAlerts />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
