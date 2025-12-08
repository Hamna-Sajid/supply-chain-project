import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
}

function KPICard({ title, value, subtitle, icon }: KPICardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" style={{ color: "#005461" }}>
          {value}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <KPICard title="Products in Production" value="12" icon="🏭" subtitle="Active production runs" />
      <KPICard title="Pending Material Orders" value="8" icon="📋" subtitle="Awaiting delivery" />
      <KPICard title="Finished Goods Stock" value="2,450" icon="📦" subtitle="Units in inventory" />
    </div>
  )
}
