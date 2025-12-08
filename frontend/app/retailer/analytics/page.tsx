"use client"

import { useState } from "react"
import { RetailerSidebar } from "@/components/retailer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

interface Transaction {
    id: string
    date: string
    type: "Revenue" | "Expense"
    category: string
    amount: number
    description: string
}

const revenueData = [
    { month: "Jan", revenue: 28000, profit: 8400 },
    { month: "Feb", revenue: 32000, profit: 9600 },
    { month: "Mar", revenue: 29000, profit: 8700 },
    { month: "Apr", revenue: 35000, profit: 10500 },
    { month: "May", revenue: 38000, profit: 11400 },
    { month: "Jun", revenue: 42000, profit: 12600 },
    { month: "Jul", revenue: 45000, profit: 13500 },
    { month: "Aug", revenue: 48000, profit: 14400 },
    { month: "Sep", revenue: 46000, profit: 13800 },
    { month: "Oct", revenue: 50000, profit: 15000 },
    { month: "Nov", revenue: 52000, profit: 15600 },
    { month: "Dec", revenue: 55000, profit: 16500 },
]

const expenseCategories = [
    { name: "Rent", value: 45000, color: "#005461" },
    { name: "Utilities", value: 12000, color: "#018790" },
    { name: "Salaries", value: 68000, color: "#00a6b8" },
    { name: "Marketing", value: 25000, color: "#4db8cc" },
    { name: "Maintenance", value: 8000, color: "#99d4dd" },
]

const transactionHistory: Transaction[] = [
    { id: "TXN-001", date: "2024-01-16", type: "Revenue", category: "Sales", amount: 2450, description: "Daily sales" },
    {
        id: "TXN-002",
        date: "2024-01-16",
        type: "Expense",
        category: "Utilities",
        amount: 450,
        description: "Electricity bill",
    },
    { id: "TXN-003", date: "2024-01-15", type: "Revenue", category: "Sales", amount: 3200, description: "Daily sales" },
    { id: "TXN-004", date: "2024-01-15", type: "Expense", category: "Rent", amount: 5000, description: "Monthly rent" },
    { id: "TXN-005", date: "2024-01-14", type: "Revenue", category: "Sales", amount: 2800, description: "Daily sales" },
]

export default function FinancialsAnalyticsPage() {
    const [expenseForm, setExpenseForm] = useState({
        amount: "",
        category: "",
        description: "",
    })

    const totalRevenueYTD = revenueData.reduce((sum, item) => sum + item.revenue, 0)
    const totalExpensesYTD = 158000
    const netProfitYTD = totalRevenueYTD - totalExpensesYTD

    const handleAddExpense = () => {
        console.log("Adding expense:", expenseForm)
        setExpenseForm({ amount: "", category: "", description: "" })
    }

    return (
        <div className="flex">
            <RetailerSidebar />

            <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
                <div className="p-6 lg:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
                            Financials & Analytics
                        </h1>
                        <p className="text-gray-600 mt-2">Monitor your revenue, expenses, and profitability</p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <p className="text-sm text-gray-600 mb-2">Total Revenue YTD</p>
                                <p className="text-3xl font-bold" style={{ color: "#005461" }}>
                                    ${(totalRevenueYTD / 1000).toFixed(0)}K
                                </p>
                                <p className="text-xs text-green-600 mt-2">↑ 12% from last year</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <p className="text-sm text-gray-600 mb-2">Total Expenses YTD</p>
                                <p className="text-3xl font-bold text-red-600">${(totalExpensesYTD / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-red-600 mt-2">↑ 5% from last year</p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <p className="text-sm text-gray-600 mb-2">Net Profit YTD</p>
                                <p className="text-3xl font-bold text-green-600">${(netProfitYTD / 1000).toFixed(0)}K</p>
                                <p className="text-xs text-green-600 mt-2">↑ 18% from last year</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Revenue & Profit Trend */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-lg">Revenue and Profit Trend (12 Months)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#018790" strokeWidth={2} name="Revenue" />
                                        <Line type="monotone" dataKey="profit" stroke="#005461" strokeWidth={2} name="Profit" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Expense Breakdown */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-lg">Expense Breakdown by Category</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={expenseCategories}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label
                                            dataKey="value"
                                        >
                                            {expenseCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Manual Expense Entry & Transaction History */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            {/* Transaction History */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="border-b pb-4">
                                    <CardTitle className="text-lg">Revenue & Expense History</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Transaction ID</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactionHistory.map((transaction) => (
                                                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-medium text-gray-900">{transaction.id}</td>
                                                        <td className="py-3 px-4 text-gray-600">{transaction.date}</td>
                                                        <td className="py-3 px-4">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-semibold ${transaction.type === "Revenue"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-red-100 text-red-800"
                                                                    }`}
                                                            >
                                                                {transaction.type}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-900">{transaction.category}</td>
                                                        <td className="py-3 px-4 text-gray-600">{transaction.description}</td>
                                                        <td
                                                            className={`py-3 px-4 font-semibold ${transaction.type === "Revenue" ? "text-green-600" : "text-red-600"
                                                                }`}
                                                        >
                                                            {transaction.type === "Revenue" ? "+" : "-"}${transaction.amount.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Manual Expense Entry */}
                        <div>
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="border-b pb-4">
                                    <CardTitle className="text-lg">Manual Expense Entry</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Amount</label>
                                            <Input
                                                type="number"
                                                value={expenseForm.amount}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                                placeholder="e.g., 500"
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Category</label>
                                            <select
                                                value={expenseForm.category}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                                className="w-full text-sm border border-gray-200 rounded px-3 py-2"
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Rent">Rent</option>
                                                <option value="Utilities">Utilities</option>
                                                <option value="Salaries">Salaries</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Maintenance">Maintenance</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                                            <textarea
                                                value={expenseForm.description}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                                placeholder="Expense description..."
                                                rows={3}
                                                className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#018790]"
                                            />
                                        </div>

                                        <Button
                                            className="w-full text-white py-5 font-semibold"
                                            style={{ backgroundColor: "#018790" }}
                                            onClick={handleAddExpense}
                                        >
                                            Add Expense
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
