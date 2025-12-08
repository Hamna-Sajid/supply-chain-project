import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RetailerKPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
}

function RetailerKPICard({ title, value, subtitle, icon }: RetailerKPICardProps) {
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

export function RetailerKPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <RetailerKPICard title="Today's Sales Revenue" value="$8,450" icon="💰" subtitle="Total sales today" />
      <RetailerKPICard title="Total Net Profit" value="$2,340" icon="📈" subtitle="Month to date" />
      <RetailerKPICard title="Low Stock Items" value="12" icon="⚠️" subtitle="Requires reorder" />
      <RetailerKPICard title="Pending Returns" value="5" icon="↩️" subtitle="Awaiting approval" />
    </div>
  )
}
