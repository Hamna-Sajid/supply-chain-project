"use client"

import { useState } from "react"
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
import { Home, Package, Truck, DollarSign, Star, Bell, LogOut, Menu, X } from "lucide-react"

// Mock data
const materialStockData = [
  { name: "Steel", quantity: 450 },
  { name: "Aluminum", quantity: 380 },
  { name: "Plastic", quantity: 290 },
  { name: "Copper", quantity: 210 },
  { name: "Rubber", quantity: 180 },
]

const revenueExpenseData = [
  { month: "Jan", revenue: 45000, expense: 28000 },
  { month: "Feb", revenue: 52000, expense: 31000 },
  { month: "Mar", revenue: 48000, expense: 29000 },
  { month: "Apr", revenue: 61000, expense: 35000 },
  { month: "May", revenue: 55000, expense: 32000 },
  { month: "Jun", revenue: 67000, expense: 38000 },
]

const pendingOrders = [
  { id: "ORD-001", manufacturer: "ABC Manufacturing", amount: 12500, status: "Pending" },
  { id: "ORD-002", manufacturer: "XYZ Industries", amount: 8900, status: "Pending" },
  { id: "ORD-003", manufacturer: "Tech Solutions", amount: 15300, status: "Pending" },
  { id: "ORD-004", manufacturer: "Prime Corp", amount: 11200, status: "Pending" },
  { id: "ORD-005", manufacturer: "Global Suppliers", amount: 9800, status: "Pending" },
]

const notifications = [
  { id: 1, message: "New order from ABC Manufacturing", time: "2 hours ago" },
  { id: 2, message: "5-star rating received from XYZ Industries", time: "4 hours ago" },
  { id: 3, message: "Order ORD-001 delivery confirmed", time: "1 day ago" },
  { id: 4, message: "Payment received for ORD-425", time: "2 days ago" },
]

const navItems = [
  { icon: Home, label: "Dashboard", href: "#" },
  { icon: Package, label: "Materials Catalog", href: "#" },
  { icon: Truck, label: "Manufacturer Orders", href: "#" },
  { icon: DollarSign, label: "Financials", href: "#" },
  { icon: Star, label: "Ratings & Reviews", href: "#" },
  { icon: Bell, label: "Notifications/Alerts", href: "#" },
]

export function SupplierDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-[#F4F4F4]">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-[#005461] text-white transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0"
        } md:relative md:w-64`}
      >
        <div className="p-6 border-b border-[#003D4D]">
          <h1 className="text-2xl font-bold">SCM</h1>
          <p className="text-sm text-gray-300">Supplier Portal</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#018790] transition-colors"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full text-white border-white hover:bg-[#018790] bg-transparent">
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-2xl font-bold text-[#005461]">Supplier Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-800">John Supplier</p>
              <p className="text-sm text-gray-600">Supplier ID: SUP-2024</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#018790]">$328,400</div>
                <p className="text-xs text-green-600 mt-2">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#005461]">$193,200</div>
                <p className="text-xs text-red-600 mt-2">+8.2% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">$135,200</div>
                <p className="text-xs text-green-600 mt-2">+15.3% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">4.8/5.0</div>
                <p className="text-xs text-gray-600 mt-2">Based on 324 reviews</p>
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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={materialStockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#018790" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Financial Trend Chart */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#005461]">Revenue vs Expense History</CardTitle>
              </CardHeader>
              <CardContent>
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Manufacturer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                          <td className="py-3 px-4 text-gray-700">{order.manufacturer}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">${order.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Button size="sm" className="bg-[#018790] hover:bg-[#015d6f] text-white">
                              Process
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Feed */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#005461]">Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                      <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
