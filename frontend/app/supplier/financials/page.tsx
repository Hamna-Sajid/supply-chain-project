"use client"

import { useState, useEffect } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

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
}

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState("revenue")
  const [revenue, setRevenue] = useState<RevenueTransaction[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpense, setNewExpense] = useState({ amount: "", category: "", description: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        // Fetch revenue
        const revenueRes = await fetch(`${API_URL}/supplier/revenue`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (revenueRes.ok) {
          const data = await revenueRes.json()
          setRevenue(data.revenue || [])
        }

        // Fetch expenses
        const expenseRes = await fetch(`${API_URL}/supplier/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (expenseRes.ok) {
          const data = await expenseRes.json()
          setExpenses(data.expenses || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load financial data")
      } finally {
        setLoading(false)
      }
    }

    fetchFinancials()
  }, [])

  const totalRevenue = revenue.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const handleAddExpense = async () => {
    if (newExpense.amount && newExpense.category) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/supplier/expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Number.parseFloat(newExpense.amount),
            category: newExpense.category,
            description: newExpense.description,
          }),
        })

        if (response.ok) {
          const newExp = await response.json()
          setExpenses([...expenses, newExp])
          setNewExpense({ amount: "", category: "", description: "" })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add expense")
      }
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/supplier/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setExpenses(expenses.filter((e) => e.id !== id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense")
    }
  }

  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Financials
            </h1>
            <p className="text-gray-600 mt-2">Revenue and expense tracking</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading financial data...</p>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">+${totalRevenue.toLocaleString()}+</div>
                    <p className="text-xs text-gray-600 mt-2">From {revenue.length} transactions</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">+${totalExpenses.toLocaleString()}+</div>
                    <p className="text-xs text-gray-600 mt-2">{expenses.length} expense records</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <div className="mb-6 border-b border-gray-200">
                <button onClick={() => setActiveTab("revenue")} className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === "revenue" ? "border-b-2 text-[#018790]" : "text-gray-600 hover:text-gray-800"}`} style={activeTab === "revenue" ? { borderBottomColor: "#018790" } : {}}>Revenue Tracking</button>
                <button onClick={() => setActiveTab("expenses")} className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === "expenses" ? "border-b-2 text-[#018790]" : "text-gray-600 hover:text-gray-800"}`} style={activeTab === "expenses" ? { borderBottomColor: "#018790" } : {}}>Expense Management</button>
              </div>

              {/* Revenue Tab */}
              {activeTab === "revenue" && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Transaction ID</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Source</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenue.length > 0 ? (
                            revenue.map((transaction) => (
                              <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-blue-600">{transaction.id}</td>
                                <td className="py-3 px-4 font-semibold text-green-600">+${transaction.amount.toLocaleString()}+</td>
                                <td className="py-3 px-4 text-gray-600">{transaction.source}</td>
                                <td className="py-3 px-4 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={4} className="text-center py-6 text-gray-500">No revenue transactions found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Expenses Tab */}
              {activeTab === "expenses" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Add New Expense</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Amount</label>
                        <Input type="number" placeholder="0.00" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm">
                          <option value="">Select category</option>
                          <option value="Operations">Operations</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea placeholder="Brief description" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" rows={3} />
                      </div>
                      <Button onClick={handleAddExpense} className="w-full text-white" style={{ backgroundColor: "#018790" }}>Add Expense</Button>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader><CardTitle className="text-lg">Expense Records</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">ID</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenses.length > 0 ? (
                              expenses.map((expense) => (
                                <tr key={expense.id} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-4 font-medium">{expense.id}</td>
                                  <td className="py-3 px-4"><Badge className="bg-blue-100 text-blue-800">{expense.category}</Badge></td>
                                  <td className="py-3 px-4 font-semibold text-red-600">+${expense.amount.toLocaleString()}+</td>
                                  <td className="py-3 px-4 text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                                  <td className="py-3 px-4"><Button size="sm" variant="outline" className="h-7 text-red-600 hover:text-red-700 bg-transparent" onClick={() => handleDeleteExpense(expense.id)}><Trash2 size={14} /></Button></td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan={5} className="text-center py-6 text-gray-500">No expenses recorded</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
