"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InventoryItem {
  id: string
  product_id: string
  product_name: string
  category: string
  sku: string
  quantity_available: number
  reorder_level: number
  cost_price: number
  selling_price: number
  status: string
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retailer/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          return
        }

        const data = await response.json()
        setInventory(data.inventory || [])
      } catch (error) {
        console.error("Error fetching inventory:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  const getStatusColor = (quantity: number, reorderLevel: number) => {
    if (quantity <= reorderLevel) return "text-red-600"
    if (quantity <= reorderLevel * 1.5) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-2">View and manage your retail stock</p>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Current Inventory</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading inventory...</div>
              ) : inventory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Available</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Reorder Level</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Cost Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Selling Price</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.product_name}</td>
                          <td className="py-3 px-4 text-gray-600">{item.sku}</td>
                          <td className="py-3 px-4 text-gray-600">{item.category}</td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            {item.quantity_available}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">{item.reorder_level}</td>
                          <td className="py-3 px-4 text-right text-gray-600">${item.cost_price}</td>
                          <td className="py-3 px-4 text-right text-gray-600">${item.selling_price}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-semibold ${getStatusColor(item.quantity_available, item.reorder_level)}`}>
                              {item.quantity_available <= item.reorder_level ? "Low" : "OK"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No inventory items</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
