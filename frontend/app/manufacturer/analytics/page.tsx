"use client"

import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
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
    BarChart,
    Bar,
} from "recharts"

const revenueData = [
    { month: "Jan", revenue: 45000, expenses: 28000 },
    { month: "Feb", revenue: 52000, expenses: 31000 },
    { month: "Mar", revenue: 48000, expenses: 29000 },
    { month: "Apr", revenue: 61000, expenses: 35000 },
    { month: "May", revenue: 55000, expenses: 32000 },
    { month: "Jun", revenue: 67000, expenses: 38000 },
]

export default function FinancialsAnalytics() {
    return (
        <div className="flex">
            <ManufacturerSidebar />

            <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
                <div className="p-6 lg:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
                            Financials & Analytics
                        </h1>
                        <p className="text-gray-600 mt-2">Financial performance and reporting</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-green-600">$328,000</div>
                                <p className="text-xs text-gray-600 mt-1">YTD Revenue</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-orange-600">$193,000</div>
                                <p className="text-xs text-gray-600 mt-1">YTD Expenses</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold text-blue-600">$135,000</div>
                                <p className="text-xs text-gray-600 mt-1">Net Profit</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold" style={{ color: "#018790" }}>
                                    41.2%
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Profit Margin</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    </div>
                </div>
            </main>
        </div>
    )
}
