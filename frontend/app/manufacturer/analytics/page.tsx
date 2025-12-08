"use client"

import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface AnalyticsData {
  totalRevenue: number
  totalExpense: number
  netProfit: number
  yearToDateRevenue: number
}

export default function FinancialsAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch analytics")
        }

        const data = await response.json()
        setAnalyticsData(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError(err instanceof Error ? err.message : "Error loading analytics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Only create chart data if we have analytics data
  const hasData = analyticsData && analyticsData.totalRevenue > 0
  const revenueData = hasData
    ? [
        { month: "Jan", revenue: analyticsData.totalRevenue * 0.3, expenses: analyticsData.totalExpense * 0.3 },
        { month: "Feb", revenue: analyticsData.totalRevenue * 0.35, expenses: analyticsData.totalExpense * 0.35 },
        { month: "Mar", revenue: analyticsData.totalRevenue * 0.4, expenses: analyticsData.totalExpense * 0.4 },
        { month: "Apr", revenue: analyticsData.totalRevenue * 0.5, expenses: analyticsData.totalExpense * 0.5 },
        { month: "May", revenue: analyticsData.totalRevenue * 0.7, expenses: analyticsData.totalExpense * 0.7 },
        { month: "Jun", revenue: analyticsData.totalRevenue, expenses: analyticsData.totalExpense },
      ]
    : []

  const profitMargin = analyticsData
    ? ((analyticsData.netProfit / analyticsData.totalRevenue) * 100).toFixed(1)
    : "0"

  return (
    <div className="flex">
      <ManufacturerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Financials & Analytics
            </h1>
            <p className="text-gray-600 mt-2">Financial performance and reporting</p>
          </div>

          {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? "..." : `$${(analyticsData?.yearToDateRevenue || 0).toLocaleString()}`}
                </div>
                <p className="text-xs text-gray-600 mt-1">YTD Revenue</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {isLoading ? "..." : `$${(analyticsData?.totalExpense || 0).toLocaleString()}`}
                </div>
                <p className="text-xs text-gray-600 mt-1">YTD Expenses</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? "..." : `$${(analyticsData?.netProfit || 0).toLocaleString()}`}
                </div>
                <p className="text-xs text-gray-600 mt-1">Net Profit</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold" style={{ color: "#018790" }}>
                  {isLoading ? "..." : `${profitMargin}%`}
                </div>
                <p className="text-xs text-gray-600 mt-1">Profit Margin</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {hasData ? (
              <>
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Revenue vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#018790" strokeWidth={2} />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Monthly Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData.map((d) => ({ month: d.month, profit: d.revenue - d.expenses }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No analytics data available yet</p>
                      <p className="text-sm mt-2">Start creating products and placing orders to see analytics</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
