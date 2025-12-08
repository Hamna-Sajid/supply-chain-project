"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface LowStockItem {
  id: string
  productName: string
  currentStock: number
  reorderLevel: number
  category: string
}

export function WarehouseLowStockAlerts() {
  const [items, setItems] = useState<LowStockItem[]>([])
  const [filters, setFilters] = useState({ category: "all" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouse/inventory/low-stock`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()
        setItems(data || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching low stock items:", err)
        setError("Failed to load low stock items")
      } finally {
        setLoading(false)
      }
    }

    fetchLowStockItems()
  }, [])

  const filteredItems = items.filter((item) => filters.category === "all" || item.category === filters.category)
  const categories = ["all", ...new Set(items.map((item) => item.category))]

  return (
    <Card className="border-0 shadow-sm bg-red-50 border-l-4" style={{ borderLeftColor: "#dc2626" }}>
      <CardHeader className="border-b pb-4 bg-white">
        <div className="flex items-center gap-2">
          <AlertCircle size={24} style={{ color: "#dc2626" }} />
          <CardTitle className="text-lg" style={{ color: "#dc2626" }}>
            Low Stock Alerts
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        {loading && <div className="text-center py-6 text-gray-500">Loading stock data...</div>}
        
        {!loading && (
          <>
            {/* Filter */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Filter by Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ category: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Low Stock Table */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500">All items are in healthy stock levels</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Product Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Current Stock</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Reorder Level</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const stockPercentage = (item.currentStock / item.reorderLevel) * 100
                      return (
                        <tr key={item.id} className="border-b hover:bg-red-100/30">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.id}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{item.currentStock}</td>
                          <td className="py-3 px-4">{item.reorderLevel}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`${
                                stockPercentage < 30 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {stockPercentage < 30 ? "Critical" : "Low"}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
