import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  href?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, href }: StatsCardProps) {
  const CardWrapper = href ? Link : "div"
  const cardProps = href ? { href, className: "block transition-transform hover:scale-105" } : {}

  return (
    <CardWrapper {...cardProps}>
      <Card
        className={`bg-gray-800/50 border-gray-700 ${href ? "cursor-pointer hover:bg-gray-800/70 transition-colors" : ""}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
          <Icon className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>
              {trend.isPositive ? "+" : ""}
              {trend.value}% em relação ao mês anterior
            </p>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}
