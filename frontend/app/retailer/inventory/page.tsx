"use client"
import { RetailerSidebar } from "@/components/retailer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  quantityAvailable: number
  reorderLevel: number
  costPrice: number
  sellingPrice: number
  profitMargin: number
  lastUpdated: string
}

const inventoryData: InventoryItem[] = [
  {
    id: "INV-001",
    name: "Wireless Mouse",
    quantityAvailable: 12,
    reorderLevel: 50,
    costPrice: 18,
    sellingPrice: 35,
    profitMargin: 94.4,
    lastUpdated: "2024-01-16 10:30 AM",
  },
  {
    id: "INV-002",
    name: "Mechanical Keyboard",
    quantityAvailable: 5,
    reorderLevel: 20,
    costPrice: 45,
    sellingPrice: 89,
    profitMargin: 97.8,
    lastUpdated: "2024-01-16 09:15 AM",
  },
  {
    id: "INV-003",
    name: "USB Hub",
    quantityAvailable: 8,
    reorderLevel: 100,
    costPrice: 12,
    sellingPrice: 25,
    profitMargin: 108.3,
    lastUpdated: "2024-01-15 02:00 PM",
  },
  {
    id: "INV-004",
    name: "Monitor Stand",
    quantityAvailable: 25,
    reorderLevel: 15,
    costPrice: 22,
    sellingPrice: 45,
    profitMargin: 104.5,
    lastUpdated: "2024-01-16 11:45 AM",
  },
  {
    id: "INV-005",
    name: "Desk Lamp",
    quantityAvailable: 120,
    reorderLevel: 30,
    costPrice: 28,
    sellingPrice: 55,
    profitMargin: 96.4,
    lastUpdated: "2024-01-16 08:20 AM",
  },
]

export default function RetailInventoryPage() {
  const lowStockItems = inventoryData.filter((item) => item.quantityAvailable < item.reorderLevel)

  return (
    <div className="flex">
      <RetailerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Retail Inventory
            </h1>
            <p className="text-gray-600 mt-2">Manage your retail stock levels and reorder points</p>
          </div>

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <Card className="border-0 shadow-sm mb-6 border-l-4" style={{ borderLeftColor: "#dc2626" }}>
              <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-red-600" />
                  <CardTitle className="text-lg text-red-600">Low Stock Items ({lowStockItems.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.id}</p>
                        </div>
                        <Badge className="bg-red-600 text-white">Critical</Badge>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p>
                          Current Stock: <strong>{item.quantityAvailable}</strong> / Reorder Level:{" "}
                          <strong>{item.reorderLevel}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Retail Inventory */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Current Retail Inventory</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Product Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantity Available</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Cost Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Selling Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Profit Margin (%)</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold px-3 py-1 rounded ${
                              item.quantityAvailable < item.reorderLevel ? "bg-red-100 text-red-700" : "text-gray-900"
                            }`}
                          >
                            {item.quantityAvailable}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">${item.costPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-600">${item.sellingPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">{item.profitMargin.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-gray-600">{item.lastUpdated}</td>
                      </tr>
                    ))}
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
