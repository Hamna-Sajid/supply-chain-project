"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Sale {
  date: string
  total: number
}

interface ChartDataPoint {
  date: string
  sales: number
}

export function SalesAnalyticsChart() {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retailer/sales`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          return
        }

        const sales = await response.json()

        // Group sales by date and sum amounts
        const groupedByDate: Record<string, number> = {}

        if (sales.sales && Array.isArray(sales.sales)) {
          sales.sales.forEach((sale: Sale) => {
            const date = new Date(sale.date).toLocaleDateString()
            groupedByDate[date] = (groupedByDate[date] || 0) + (sale.total || 0)
          })
        }

        // Convert to chart data format and sort by date
        const chartData = Object.entries(groupedByDate)
          .map(([date, sales]) => ({
            date,
            sales: Math.round(sales),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7) // Last 7 days

        setData(chartData)
      } catch (error) {
        console.error("Error fetching sales data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSalesData()
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-sm mb-8">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg">Sales and Profit Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm mb-8">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Sales and Profit Trend (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#018790" strokeWidth={2} name="Daily Sales" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">No sales data available</div>
        )}
      </CardContent>
    </Card>
  )
}
