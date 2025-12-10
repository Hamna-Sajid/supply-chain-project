"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  isLoading?: boolean
}

function KPICard({ title, value, subtitle, icon, isLoading }: KPICardProps) {
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
          {isLoading ? "..." : value}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export function KPICards() {
  const [kpis, setKpis] = useState({
    totalProduction: 0,
    totalOrders: 0,
    totalInventory: 0,
    totalShipments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        
        if (!token) {
          throw new Error("No authentication token found. Please log in.")
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error Response:", errorText)
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()
        setKpis(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching KPIs:", err)
        setError(err instanceof Error ? err.message : "Error loading data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchKPIs()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {error && <div className="col-span-full text-red-600 text-sm">{error}</div>}
      <KPICard
        title="Products in Production"
        value={kpis.totalProduction}
        icon="🏭"
        subtitle="Active production runs"
        isLoading={isLoading}
      />
      <KPICard
        title="Pending Material Orders"
        value={kpis.totalOrders}
        icon="📋"
        subtitle="Awaiting delivery"
        isLoading={isLoading}
      />
      <KPICard
        title="Finished Goods Stock"
        value={kpis.totalInventory}
        icon="📦"
        subtitle="Units in inventory"
        isLoading={isLoading}
      />
    </div>
  )
}
