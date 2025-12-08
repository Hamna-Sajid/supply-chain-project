"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SalesData {
    date: string
    amount: number
    quantity: number
}

export default function AnalyticsPage() {
    const [salesData, setSalesData] = useState<SalesData[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalSales: 0,
        totalQuantity: 0,
        averagePerSale: 0,
    })

    useEffect(() => {
        const fetchAnalytics = async () => {
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

                const data = await response.json()
                const sales = data.sales || []

                // Group sales by date
                const groupedByDate: Record<string, { amount: number; quantity: number }> = {}

                sales.forEach((sale: any) => {
                    const date = new Date(sale.date).toLocaleDateString()
                    if (!groupedByDate[date]) {
                        groupedByDate[date] = { amount: 0, quantity: 0 }
                    }
                    groupedByDate[date].amount += sale.total || 0
                    if (sale.items && Array.isArray(sale.items)) {
                        groupedByDate[date].quantity += sale.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
                    }
                })

                // Convert to chart data
                const chartData = Object.entries(groupedByDate)
                    .map(([date, data]) => ({
                        date,
                        amount: Math.round(data.amount),
                        quantity: data.quantity,
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

                setSalesData(chartData)

                // Calculate statistics
                const totalSales = sales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0)
                const totalQuantity = sales.reduce((sum: number, sale: any) => {
                    if (sale.items && Array.isArray(sale.items)) {
                        return sum + sale.items.reduce((s: number, item: any) => s + (item.quantity || 0), 0)
                    }
                    return sum
                }, 0)

                setStats({
                    totalSales: Math.round(totalSales),
                    totalQuantity,
                    averagePerSale: sales.length > 0 ? Math.round(totalSales / sales.length) : 0,
                })
            } catch (error) {
                console.error("Error fetching analytics:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [])

    return (
        <div className="flex">
            <Sidebar />

            <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
                <div className="p-6 lg:p-8 relative">
                    <WarehouseHeader />

                    <div className="mb-8 pr-48">
                        <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
                            Sales Analytics
                        </h1>
                        <p className="text-gray-600 mt-2">View your sales performance and trends</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading analytics...</div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                                            ${stats.totalSales}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-600">Items Sold</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                                            {stats.totalQuantity}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-gray-600">Avg. Per Sale</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                                            ${stats.averagePerSale}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="border-b pb-4">
                                        <CardTitle className="text-lg">Sales Trend</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {salesData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={salesData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip formatter={(value: any) => `$${value}`} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="amount" stroke="#018790" strokeWidth={2} name="Sales Amount" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">No data available</div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="border-b pb-4">
                                        <CardTitle className="text-lg">Quantity Sold</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {salesData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={salesData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="quantity" fill="#005461" name="Items Sold" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">No data available</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
