"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const salesTrendData = [
  { date: "Jan 1", sales: 2400, profit: 640 },
  { date: "Jan 5", sales: 3200, profit: 890 },
  { date: "Jan 10", sales: 2800, profit: 720 },
  { date: "Jan 15", sales: 3900, profit: 1080 },
  { date: "Jan 20", sales: 4200, profit: 1150 },
  { date: "Jan 25", sales: 3800, profit: 980 },
  { date: "Jan 30", sales: 4500, profit: 1280 },
]

export function SalesAnalyticsChart() {
  return (
    <Card className="border-0 shadow-sm mb-8">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Sales and Profit Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#018790" strokeWidth={2} name="Sales" />
            <Line type="monotone" dataKey="profit" stroke="#005461" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
