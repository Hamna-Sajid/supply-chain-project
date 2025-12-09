"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { SupplierPaymentsPanel } from "@/components/supplier-payments-panel"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface DashboardData {
  total_revenue: number
  total_expenses: number
  net_profit: number
  average_rating: number
  pending_orders_count: number
  delivered_orders_count: number
  cancelled_orders_count: number
  total_orders_count: number
  order_status_breakdown?: Record<string, number>
}

interface MaterialStock {
  material_name: string
  quantity_available: number
}

interface PendingOrder {
  id: string
  manufacturer_name: string
  total_amount: number
  status: string
}

interface FinancialData {
  month: string
  revenue: number
  expense: number
}

export function SupplierDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [materialStockData, setMaterialStockData] = useState<MaterialStock[]>([])
  const [revenueExpenseData, setRevenueExpenseData] = useState<FinancialData[]>([])
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError("")

        // Get user from localStorage
        const userData = localStorage.getItem("user")
        if (userData) {
          setUser(JSON.parse(userData))
        }

        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        // Fetch dashboard aggregated data
        const dashboardRes = await fetch(`${API_URL}/supplier/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (dashboardRes.ok) {
          const data = await dashboardRes.json()
          console.log('Dashboard data received:', data)
          setDashboardData(data)
        } else {
          console.error("Failed to fetch dashboard data", dashboardRes.status)
        }

        // Fetch material stock
        const materialsRes = await fetch(`${API_URL}/supplier/materials/stock/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (materialsRes.ok) {
          const data = await materialsRes.json()
          setMaterialStockData(data.materials || [])
        }

        // Fetch pending orders
        const ordersRes = await fetch(`${API_URL}/supplier/orders/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setPendingOrders(data.orders || [])
        }

        // Fetch revenue and expense data for historical chart
        try {
          const revenueRes = await fetch(`${API_URL}/supplier/revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const expenseRes = await fetch(`${API_URL}/supplier/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (revenueRes.ok && expenseRes.ok) {
            const revenueData = await revenueRes.json()
            const expenseData = await expenseRes.json()

            // Group data by month for chart display
            const revenues = revenueData.revenue || []
            const expenses = expenseData.expenses || []

            if (revenues.length > 0 || expenses.length > 0) {
              // Process and aggregate data by month
              const monthlyData: Record<string, { month: string; revenue: number; expense: number }> = {}

              revenues.forEach((r: any) => {
                const date = new Date(r.created_at)
                const month = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                if (!monthlyData[month]) {
                  monthlyData[month] = { month, revenue: 0, expense: 0 }
                }
                monthlyData[month].revenue += r.amount || 0
              })

              expenses.forEach((e: any) => {
                const date = new Date(e.created_at)
                const month = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                if (!monthlyData[month]) {
                  monthlyData[month] = { month, revenue: 0, expense: 0 }
                }
                monthlyData[month].expense += e.amount || 0
              })

              setRevenueExpenseData(Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)))
            }
          }
        } catch (err) {
          console.error("Financial data fetch error:", err)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F4F4F4]">
        <SupplierSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-screen bg-[#F4F4F4]">
      <SupplierSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-0 lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h2 className="text-2xl font-bold text-[#005461]">Supplier Dashboard</h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10" style={{ backgroundColor: "#018790" }}>
              <AvatarFallback className="font-bold text-white text-lg bg-[#018790]">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="font-semibold text-gray-800">{user?.name || "Supplier"}</p>
              <p className="text-sm text-gray-600">Supplier Account</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 m-6 rounded">
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#018790]">
                  ${(dashboardData?.total_revenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-600 mt-2">From delivered orders</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#005461]">
                  ${(dashboardData?.total_expenses || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-600 mt-2">All recorded expenses</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${(dashboardData?.net_profit || 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-600 mt-2">Revenue minus expenses</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">
                  {dashboardData?.average_rating ? dashboardData.average_rating.toFixed(1) : "N/A"}/5.0
                </div>
                <p className="text-xs text-gray-600 mt-2">Customer satisfaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Material Stock Chart */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#005461]">Top 5 Raw Materials by Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                {materialStockData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={materialStockData.map((m) => ({
                        name: m.material_name,
                        quantity: m.quantity_available,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#018790" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No material data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Trend Chart */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#005461]">Revenue vs Expense History</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueExpenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueExpenseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#018790" strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" stroke="#005461" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Orders and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Orders */}
            <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#005461]">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Manufacturer</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                            <td className="py-3 px-4 text-gray-700">{order.manufacturer_name}</td>
                            <td className="py-3 px-4 font-semibold text-gray-900">
                              ${order.total_amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">No pending orders</div>
                )}
              </CardContent>
            </Card>

            {/* Orders Summary */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#005461]">Orders Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-[#005461]">
                      {dashboardData?.total_orders_count || 0}
                    </p>
                  </div>
                  <hr />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending/Processing</span>
                      <span className="font-semibold text-yellow-600">
                        {dashboardData?.pending_orders_count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivered</span>
                      <span className="font-semibold text-green-600">
                        {dashboardData?.delivered_orders_count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cancelled</span>
                      <span className="font-semibold text-red-600">
                        {dashboardData?.cancelled_orders_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Status Section */}
          <div className="mt-8">
            <SupplierPaymentsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
