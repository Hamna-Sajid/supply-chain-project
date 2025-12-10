"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardData {
  incomingShipments: number
  totalStockValue: number
  readyForShipment: number
}

export function WarehouseDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouse/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          throw new Error(`Server error: ${response.status}`)
        }

        const dashboardData = await response.json()
        setData(dashboardData)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div className="text-center py-6 text-gray-500">Loading dashboard...</div>
  }

  if (error) {
    return <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
  }

  if (!data) {
    return <div className="text-center py-6 text-gray-500">No dashboard data available</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Incoming Shipments (Today)</CardTitle>
            <span className="text-2xl">📦</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: "#005461" }}>
            {data.incomingShipments}
          </div>
          <p className="text-xs text-gray-500 mt-1">Expected deliveries</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stock Value</CardTitle>
            <span className="text-2xl">💰</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: "#005461" }}>
            ${(data.totalStockValue / 1000000).toFixed(1)}M
          </div>
          <p className="text-xs text-gray-500 mt-1">Across all SKUs</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Orders Ready for Shipment</CardTitle>
            <span className="text-2xl">🚚</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: "#005461" }}>
            {data.readyForShipment}
          </div>
          <p className="text-xs text-gray-500 mt-1">Queued for dispatch</p>
        </CardContent>
      </Card>
    </div>
  )
}
