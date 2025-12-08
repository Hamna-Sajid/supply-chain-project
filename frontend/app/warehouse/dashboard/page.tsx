"use client"

import { WarehouseSidebar } from "@/components/warehouse-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 28000 },
  { month: "Feb", revenue: 52000, expenses: 31000 },
  { month: "Mar", revenue: 48000, expenses: 29000 },
  { month: "Apr", revenue: 61000, expenses: 35000 },
  { month: "May", revenue: 55000, expenses: 32000 },
  { month: "Jun", revenue: 67000, expenses: 38000 },
]

const categoryDistribution = [
  { name: "Electronics", value: 35 },
  { name: "Hardware", value: 25 },
  { name: "Packaging", value: 20 },
  { name: "Metal Components", value: 20 },
]

const colors = ["#018790", "#005461", "#FFA500", "#FF6B6B"]

export default function WarehouseAnalyticsPage() {
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0)
  const profit = totalRevenue - totalExpenses

  return (
    <div className="flex">
      <WarehouseSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Financials & Analytics
            </h1>
            <p className="text-gray-600 mt-2">Revenue tracking and expense analysis</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#018790" }}>
                  ${(totalRevenue / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">${(totalExpenses / 1000).toFixed(0)}K</div>
                <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${(profit / 1000).toFixed(0)}K</div>
                <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue vs Expense Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Revenue vs Expense History</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#018790" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Monthly Financial Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Month</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Revenue</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Expenses</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Profit</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item) => {
                      const profit = item.revenue - item.expenses
                      const margin = ((profit / item.revenue) * 100).toFixed(1)
                      return (
                        <tr key={item.month} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                          <td className="py-3 px-4 text-green-600 font-semibold">${item.revenue.toLocaleString()}</td>
                          <td className="py-3 px-4 text-red-600 font-semibold">${item.expenses.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-900 font-semibold">${profit.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-900 font-semibold">{margin}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
