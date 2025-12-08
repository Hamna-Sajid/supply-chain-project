"use client"

import { useState } from "react"
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

const lowStockData: LowStockItem[] = [
  {
    id: "SKU-001",
    productName: "Electronic Components - Type A",
    currentStock: 45,
    reorderLevel: 100,
    category: "Electronics",
  },
  { id: "SKU-002", productName: "Steel Fasteners", currentStock: 120, reorderLevel: 500, category: "Hardware" },
  { id: "SKU-003", productName: "Plastic Containers", currentStock: 75, reorderLevel: 200, category: "Packaging" },
  { id: "SKU-004", productName: "Aluminum Frames", currentStock: 30, reorderLevel: 150, category: "Metal Components" },
]

export function WarehouseLowStockAlerts() {
  const [filters, setFilters] = useState({ category: "all" })

  const filteredItems = lowStockData.filter((item) => filters.category === "all" || item.category === filters.category)

  const categories = ["all", ...new Set(lowStockData.map((item) => item.category))]

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

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <p className="text-sm">No low stock items found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
