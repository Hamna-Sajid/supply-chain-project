"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPIData {
  todaysSalesRevenue: number
  totalProfit: number
  lowStockItems: number
  pendingReturns: number
}

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
  const [data, setData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retailer/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          return
        }

        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (error) {
        console.error("Error fetching dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="text-center py-4 text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <RetailerKPICard
        title="Today's Sales Revenue"
        value={`$${data?.todaysSalesRevenue || 0}`}
        icon="💰"
        subtitle="Total sales today"
      />
      <RetailerKPICard
        title="Total Net Profit"
        value={`$${data?.totalProfit || 0}`}
        icon="📈"
        subtitle="Month to date"
      />
      <RetailerKPICard
        title="Low Stock Items"
        value={data?.lowStockItems || 0}
        icon=""
        subtitle="Requires reorder"
      />
      <RetailerKPICard
        title="Pending Returns"
        value={data?.pendingReturns || 0}
        icon="↩️"
        subtitle="Awaiting approval"
      />
    </div>
  )
}
