"use client"

import { useState, useEffect } from "react"
import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, ShoppingCart } from "lucide-react"

interface Material {
  material_id: string
  material_name: string
  unit_price: number
  quantity_available: number
  supplier_id?: string
  supplier_name?: string
  rating?: number
  users?: {
    name: string
    id: string
    contact_number?: string
  }
}

export default function MaterialSourcing() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [orderQuantity, setOrderQuantity] = useState("")
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMaterials()
  }, [])

  useEffect(() => {
    const filtered = materials.filter(
      (m) =>
        m.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.users?.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredMaterials(filtered)
  }, [searchTerm, materials])

  const fetchMaterials = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/raw-materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch materials")
      }

      const data = await response.json()
      setMaterials(data || [])
      setFilteredMaterials(data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching materials:", err)
      setError(err instanceof Error ? err.message : "Error loading materials")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedMaterial || !orderQuantity) {
      setError("Please enter a quantity")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_id: selectedMaterial.users?.id,
          items: [
            {
              material_id: selectedMaterial.material_id,
              quantity: Number.parseInt(orderQuantity),
              unit_price: selectedMaterial.unit_price,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to place order")
      }

      setShowOrderModal(false)
      setSelectedMaterial(null)
      setOrderQuantity("")
      setError(null)
      alert("Order placed successfully!")
    } catch (err) {
      console.error("Error placing order:", err)
      setError(err instanceof Error ? err.message : "Error placing order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex">
      <ManufacturerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Material Sourcing
            </h1>
            <p className="text-gray-600 mt-2">Search and order raw materials from suppliers</p>
          </div>

          {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

          <Card className="mb-6 border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Search Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by material name or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Available Raw Materials (All Suppliers)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading materials...</div>
              ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No materials found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "#E5E7EB" }}>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Material Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Supplier
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Unit Price
                        </th>
                        <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Available Qty
                        </th>
                        <th className="text-center py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaterials.map((material) => (
                        <tr key={material.material_id} className="border-b hover:bg-gray-100 transition-colors">
                          <td className="py-3 px-4">{material.material_name}</td>
                          <td className="py-3 px-4">{material.supplier_name || material.users?.name || "Unknown Supplier"}</td>
                          <td className="py-3 px-4">${material.unit_price?.toFixed(2)}</td>
                          <td className="py-3 px-4">{material.quantity_available}</td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              style={{ backgroundColor: "#018790" }}
                              className="text-white hover:opacity-90"
                              onClick={() => {
                                setSelectedMaterial(material)
                                setShowOrderModal(true)
                              }}
                            >
                              <ShoppingCart size={16} className="mr-1" />
                              Order
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {showOrderModal && selectedMaterial && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Place Order - {selectedMaterial.material_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Supplier: {selectedMaterial.users?.name}</label>
                    <label className="block text-sm font-medium mb-2">Unit Price: ${selectedMaterial.unit_price?.toFixed(2)}</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(e.target.value)}
                    />
                    {orderQuantity && (
                      <p className="text-sm text-gray-600 mt-2">
                        Total: ${(Number.parseInt(orderQuantity) * (selectedMaterial.unit_price || 0)).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowOrderModal(false)
                        setSelectedMaterial(null)
                        setOrderQuantity("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      style={{ backgroundColor: "#018790" }}
                      className="text-white"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Placing..." : "Confirm Order"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
