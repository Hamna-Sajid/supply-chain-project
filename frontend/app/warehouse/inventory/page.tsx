"use client"

import { useState } from "react"
import { WarehouseSidebar } from "@/components/warehouse-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface InventoryItem {
  id: string
  productName: string
  currentStock: number
  reorderLevel: number
  category: string
  location: string
}

const inventoryData: InventoryItem[] = [
  {
    id: "SKU-001",
    productName: "Electronic Components - Type A",
    currentStock: 45,
    reorderLevel: 100,
    category: "Electronics",
    location: "Shelf A-12",
  },
  {
    id: "SKU-002",
    productName: "Steel Fasteners",
    currentStock: 120,
    reorderLevel: 500,
    category: "Hardware",
    location: "Bin B-5",
  },
  {
    id: "SKU-003",
    productName: "Plastic Containers",
    currentStock: 75,
    reorderLevel: 200,
    category: "Packaging",
    location: "Rack C-3",
  },
  {
    id: "SKU-004",
    productName: "Aluminum Frames",
    currentStock: 30,
    reorderLevel: 150,
    category: "Metal Components",
    location: "Shelf D-8",
  },
  {
    id: "SKU-005",
    productName: "Rubber Seals",
    currentStock: 250,
    reorderLevel: 100,
    category: "Hardware",
    location: "Bin B-2",
  },
]

export default function WarehouseInventoryPage() {
  const [filterCategory, setFilterCategory] = useState("all")

  const filteredItems =
    filterCategory === "all" ? inventoryData : inventoryData.filter((item) => item.category === filterCategory)

  const categories = ["all", ...new Set(inventoryData.map((item) => item.category))]

  const criticalItems = filteredItems.filter((item) => (item.currentStock / item.reorderLevel) * 100 < 30)

  return (
    <div className="flex">
      <WarehouseSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Warehouse Inventory
            </h1>
            <p className="text-gray-600 mt-2">Stock monitoring and low stock alerts</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total SKUs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                  {filteredItems.length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Items in inventory</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Critical Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{criticalItems.length}</div>
                <p className="text-xs text-gray-500 mt-1">Requires immediate reorder</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                  $1.8M
                </div>
                <p className="text-xs text-gray-500 mt-1">Current valuation</p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alerts */}
          {criticalItems.length > 0 && (
            <Card className="border-0 shadow-sm bg-red-50 border-l-4 mb-8" style={{ borderLeftColor: "#dc2626" }}>
              <CardHeader className="border-b pb-4 bg-white">
                <div className="flex items-center gap-2">
                  <AlertCircle size={24} style={{ color: "#dc2626" }} />
                  <CardTitle className="text-lg" style={{ color: "#dc2626" }}>
                    Critical Stock Alert
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-700 mb-4">
                  {criticalItems.length} item(s) below critical reorder levels. Immediate action required.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterCategory === cat ? "text-white" : "text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor: filterCategory === cat ? "#018790" : "transparent",
                  }}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Inventory Stock Levels</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">SKU</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Product Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Current Stock</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Reorder Level</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Location</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const stockPercentage = (item.currentStock / item.reorderLevel) * 100
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.id}</td>
                          <td className="py-3 px-4 text-gray-700">{item.productName}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{item.currentStock}</td>
                          <td className="py-3 px-4 text-gray-700">{item.reorderLevel}</td>
                          <td className="py-3 px-4 text-gray-700">{item.location}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`${
                                stockPercentage < 30
                                  ? "bg-red-100 text-red-800"
                                  : stockPercentage < 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {stockPercentage < 30 ? "Critical" : stockPercentage < 60 ? "Low" : "Adequate"}
                            </Badge>
                          </td>
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
