"use client"

import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

interface InventoryItem {
  inventory_id: string
  product_id: string
  quantity_available: number
  reorder_level: number
  cost_price: number
  selling_price: number
  products: {
    product_name: string
    sku: string
  }
}

export default function FinishedGoodsInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'cost_price' | 'selling_price' | null>(null)
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/inventory`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch inventory")
        }

        const data = await response.json()
        setInventory(data.inventory || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching inventory:", err)
        setError(err instanceof Error ? err.message : "Error loading inventory")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInventory()
  }, [])

  const getStatus = (quantity: number, reorderLevel: number) => {
    if (quantity === 0) return "Out of Stock"
    if (quantity < reorderLevel) return "Critical"
    if (quantity < reorderLevel * 1.5) return "Low"
    return "Normal"
  }

  const handleUpdatePrice = async (inventoryId: string, field: 'cost_price' | 'selling_price') => {
    const newPrice = editingPrices[inventoryId]
    if (newPrice === undefined || newPrice === null) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/inventory/${inventoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: newPrice }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || `Failed to update ${field}`)
        return
      }

      setInventory(
        inventory.map((item) =>
          item.inventory_id === inventoryId ? { ...item, [field]: newPrice } : item,
        ),
      )
      setEditingId(null)
      setEditingField(null)
      setEditingPrices({})
    } catch (err) {
      setError(`Failed to update ${field}`)
    }
  }

  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity_available, 0)
  const healthyStock = inventory.filter((item) => getStatus(item.quantity_available, item.reorder_level) === "Normal").length
  const lowStock = inventory.filter((item) => getStatus(item.quantity_available, item.reorder_level) === "Low").length
  const criticalStock = inventory.filter((item) => getStatus(item.quantity_available, item.reorder_level) === "Critical" || getStatus(item.quantity_available, item.reorder_level) === "Out of Stock").length

  return (
    <div className="flex">
      <ManufacturerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Finished Goods Inventory
            </h1>
            <p className="text-gray-600 mt-2">Monitor stock levels and warehouse locations</p>
          </div>

          {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold" style={{ color: "#005461" }}>
                  {isLoading ? "..." : totalUnits}
                </div>
                <p className="text-xs text-gray-600 mt-1">Total Units</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{isLoading ? "..." : healthyStock}</div>
                <p className="text-xs text-gray-600 mt-1">Healthy Stock</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{isLoading ? "..." : lowStock}</div>
                <p className="text-xs text-gray-600 mt-1">Low Stock</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{isLoading ? "..." : criticalStock}</div>
                <p className="text-xs text-gray-600 mt-1">Critical Stock</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Stock Levels by Location</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading inventory...</div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No inventory items found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "#E5E7EB" }}>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Product
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Current Qty
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Min. Level
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Cost Price
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Selling Price
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => {
                        const status = getStatus(item.quantity_available, item.reorder_level)
                        return (
                          <tr key={item.inventory_id} className="border-b hover:bg-gray-100 transition-colors">
                            <td className="py-3 px-4 font-medium">{item.products?.product_name || "Unknown"}</td>
                            <td className="py-3 px-4">{item.quantity_available} units</td>
                            <td className="py-3 px-4">{item.reorder_level} units</td>
                            <td className="py-3 px-4">
                              {editingId === item.inventory_id && editingField === 'cost_price' ? (
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={String(editingPrices[item.inventory_id] ?? (item.cost_price || 0))}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value)
                                      setEditingPrices({ ...editingPrices, [item.inventory_id]: isNaN(value) ? 0 : value })
                                    }}
                                    className="border rounded px-2 py-1 w-20 text-sm"
                                  />
                                  <button
                                    onClick={() => handleUpdatePrice(item.inventory_id, 'cost_price')}
                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null)
                                      setEditingField(null)
                                      setEditingPrices({})
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2 items-center">
                                  ${(item.cost_price || 0).toFixed(2)}
                                  <button
                                    onClick={() => {
                                      setEditingId(item.inventory_id)
                                      setEditingField('cost_price')
                                      setEditingPrices({ [item.inventory_id]: item.cost_price || 0 })
                                    }}
                                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {editingId === item.inventory_id && editingField === 'selling_price' ? (
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={String(editingPrices[item.inventory_id] ?? (item.selling_price || 0))}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value)
                                      setEditingPrices({ ...editingPrices, [item.inventory_id]: isNaN(value) ? 0 : value })
                                    }}
                                    className="border rounded px-2 py-1 w-20 text-sm"
                                  />
                                  <button
                                    onClick={() => handleUpdatePrice(item.inventory_id, 'selling_price')}
                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null)
                                      setEditingField(null)
                                      setEditingPrices({})
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2 items-center">
                                  ${(item.selling_price || 0).toFixed(2)}
                                  <button
                                    onClick={() => {
                                      setEditingId(item.inventory_id)
                                      setEditingField('selling_price')
                                      setEditingPrices({ [item.inventory_id]: item.selling_price || 0 })
                                    }}
                                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {status === "Critical" || status === "Out of Stock" ? (
                                <div className="flex items-center gap-1 text-red-600">
                                  <AlertTriangle size={16} />
                                  <span className="font-medium">{status}</span>
                                </div>
                              ) : status === "Low" ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-orange-500">
                                  {status}
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-green-500">
                                  {status}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
