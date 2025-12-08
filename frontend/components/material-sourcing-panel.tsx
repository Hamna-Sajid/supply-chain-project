"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface RawMaterial {
  material_id: string
  material_name: string
  unit_price: number
  quantity_available: number
  supplier_id?: string
  supplier_name?: string
  users?: {
    name: string
    id: string
  }
}

export function MaterialSourcingPanel() {
  const [materialsData, setMaterialsData] = useState<RawMaterial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null)
  const [orderQuantity, setOrderQuantity] = useState("")
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        
        if (!token) {
          throw new Error("No authentication token found. Please log in.")
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/raw-materials`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error Response:", errorText)
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()
        setMaterialsData(data || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching materials:", err)
        setError("Failed to load materials")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  const filteredMaterials = materialsData.filter((material) => {
    const matchesSearch =
      material.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const handlePlaceOrder = (material: RawMaterial) => {
    setSelectedMaterial(material)
    setOrderQuantity("")
    setIsOrderModalOpen(true)
  }

  const handleSubmitOrder = async () => {
    if (!selectedMaterial || !orderQuantity) {
      setError("Please enter a quantity")
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_id: selectedMaterial.supplier_id,
          items: [
            {
              material_id: selectedMaterial.material_id,
              quantity: parseInt(orderQuantity),
              unit_price: selectedMaterial.unit_price,
            }
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to place order: ${response.status}`)
      }

      setError(null)
      setIsOrderModalOpen(false)
      setSelectedMaterial(null)
      setOrderQuantity("")
      // Optionally refresh materials or show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order")
    }
  }

  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
  const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Browse Raw Materials</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search materials or suppliers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading && <div className="text-center py-6 text-gray-500">Loading materials...</div>}
        
        {!isLoading && materialsData.length === 0 && <div className="text-center py-6 text-gray-500">No materials available</div>}

        {!isLoading && filteredMaterials.length === 0 && materialsData.length > 0 && (
          <div className="text-center py-6 text-gray-500">No materials match your search</div>
        )}

        {!isLoading && paginatedMaterials.length > 0 && (
          <>
            {/* Materials Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Material</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Supplier</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Unit Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Available</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMaterials.map((material) => (
                    <tr key={material.material_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{material.material_name}</td>
                      <td className="py-3 px-4 text-gray-600">{material.supplier_name || "Unknown Supplier"}</td>
                      <td className="py-3 px-4">${material.unit_price?.toFixed(2)}</td>
                      <td className="py-3 px-4">{material.quantity_available}</td>
                      <td className="py-3 px-4">
                        <Button 
                          size="sm" 
                          style={{ backgroundColor: "#018790", color: "white" }}
                          onClick={() => handlePlaceOrder(material)}
                        >
                          Place Order
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Showing {paginatedMaterials.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredMaterials.length)} of {filteredMaterials.length} results
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <Button
                      key={i + 1}
                      size="sm"
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => setCurrentPage(i + 1)}
                      style={
                        currentPage === i + 1 ? { backgroundColor: "#018790", color: "white", borderColor: "#018790" } : {}
                      }
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Order Modal */}
        {isOrderModalOpen && selectedMaterial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-lg">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Place Order</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Material</label>
                  <p className="mt-1 text-gray-900 font-semibold">{selectedMaterial.material_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Supplier</label>
                  <p className="mt-1 text-gray-900">{selectedMaterial.supplier_name || "Unknown"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Unit Price</label>
                  <p className="mt-1 text-gray-900">${selectedMaterial.unit_price?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Available Quantity</label>
                  <p className="mt-1 text-gray-900">{selectedMaterial.quantity_available} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Order Quantity</label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    min="1"
                    max={selectedMaterial.quantity_available}
                    className="mt-1"
                  />
                </div>
                {orderQuantity && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total Cost:</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${(parseInt(orderQuantity) * selectedMaterial.unit_price).toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsOrderModalOpen(false)
                      setSelectedMaterial(null)
                      setOrderQuantity("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 text-white"
                    style={{ backgroundColor: "#018790" }}
                    onClick={handleSubmitOrder}
                    disabled={!orderQuantity}
                  >
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
