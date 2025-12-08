"use client"

import { useState } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2 } from "lucide-react"

interface RevenueTransaction {
  id: string
  amount: number
  date: string
  source: string
}

interface Expense {
  id: string
  amount: number
  category: string
  date: string
  description: string
  isManual: boolean
}

const mockRevenue: RevenueTransaction[] = [
  { id: "TXN-001", amount: 12500, date: "2025-01-15", source: "ABC Manufacturing" },
  { id: "TXN-002", amount: 8900, date: "2025-01-14", source: "XYZ Industries" },
  { id: "TXN-003", amount: 15300, date: "2025-01-13", source: "Tech Solutions" },
  { id: "TXN-004", amount: 11200, date: "2025-01-12", source: "Prime Corp" },
]

const mockExpenses: Expense[] = [
  {
    id: "EXP-001",
    amount: 3200,
    category: "Operations",
    date: "2025-01-15",
    description: "Warehouse rent",
    isManual: true,
  },
  {
    id: "EXP-002",
    amount: 1500,
    category: "Utilities",
    date: "2025-01-14",
    description: "Electricity bill",
    isManual: true,
  },
  {
    id: "EXP-003",
    amount: 800,
    category: "Maintenance",
    date: "2025-01-13",
    description: "Equipment maintenance",
    isManual: false,
  },
]

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState("revenue")
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [newExpense, setNewExpense] = useState({ amount: "", category: "", description: "" })
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const totalRevenue = mockRevenue.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const filteredRevenue = mockRevenue.filter((t) => {
    if (!startDate || !endDate) return true
    return t.date >= startDate && t.date <= endDate
  })

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.category) {
      setExpenses([
        ...expenses,
        {
          id: `EXP-${String(expenses.length + 1).padStart(3, "0")}`,
          amount: Number.parseFloat(newExpense.amount),
          category: newExpense.category,
          date: new Date().toISOString().split("T")[0],
          description: newExpense.description,
          isManual: true,
        },
      ])
      setNewExpense({ amount: "", category: "", description: "" })
    }
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id))
  }

  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Financials
            </h1>
            <p className="text-gray-600 mt-2">Revenue and expense tracking</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total YTD Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-600 mt-2">From {mockRevenue.length} transactions</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total YTD Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-gray-600 mt-2">From {expenses.length} entries</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab("revenue")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "revenue" ? "border-b-2 text-[#018790]" : "text-gray-600 hover:text-gray-800"
              }`}
              style={activeTab === "revenue" ? { borderBottomColor: "#018790" } : {}}
            >
              Revenue Tracking
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "expenses" ? "border-b-2 text-[#018790]" : "text-gray-600 hover:text-gray-800"
              }`}
              style={activeTab === "expenses" ? { borderBottomColor: "#018790" } : {}}
            >
              Expense Management
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "revenue" && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Revenue History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Filter */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
                  </div>
                </div>

                {/* Revenue Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Transaction ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRevenue.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{transaction.id}</td>
                          <td className="py-3 px-4 font-bold text-green-600">${transaction.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">{transaction.date}</td>
                          <td className="py-3 px-4">{transaction.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "expenses" && (
            <div className="space-y-6">
              {/* Add Manual Expense */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Add Manual Expense</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Amount ($)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2"
                      >
                        <option value="">Select category</option>
                        <option value="Operations">Operations</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <Input
                        placeholder="Expense description"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={handleAddExpense}
                      className="md:col-span-2 text-white"
                      style={{ backgroundColor: "#018790" }}
                    >
                      Add Expense
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Expense History */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Expense History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Expense ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Description</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{expense.id}</td>
                            <td className="py-3 px-4 font-bold">${expense.amount.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <Badge className="bg-blue-100 text-blue-800">{expense.category}</Badge>
                            </td>
                            <td className="py-3 px-4">{expense.date}</td>
                            <td className="py-3 px-4 text-gray-600">{expense.description}</td>
                            <td className="py-3 px-4 flex gap-2">
                              {expense.isManual && (
                                <>
                                  <Button size="sm" variant="outline" className="h-7 bg-transparent">
                                    <Edit2 size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-red-600 bg-transparent"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
