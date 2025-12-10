"use client"

import { useState, useEffect } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Material {
  material_id: string
  material_name: string
  description: string
  quantity_available: number
  unit_price: number
  created_at: string
}

export default function MaterialsCatalogPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    unitPrice: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        const response = await fetch(`${API_URL}/supplier/materials`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setMaterials(data.materials || [])
        } else {
          setError("Failed to load materials")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load materials")
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  const handleAddMaterial = async () => {
    if (formData.name && formData.quantity && formData.unitPrice) {
      try {
        const token = localStorage.getItem("token")

        if (editingId) {
          // Update existing material
          const response = await fetch(`${API_URL}/supplier/materials/${editingId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              material_name: formData.name,
              description: formData.description,
              quantity_available: Number.parseInt(formData.quantity),
              unit_price: Number.parseFloat(formData.unitPrice),
            }),
          })

          if (response.ok) {
            const updatedMaterial = await response.json()
            setMaterials(materials.map((m) => (m.material_id === editingId ? updatedMaterial : m)))
            setFormData({ name: "", description: "", quantity: "", unitPrice: "" })
            setEditingId(null)
            setError("")
            setSuccess("Material updated successfully!")
            setTimeout(() => setSuccess(""), 3000)
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Failed to update material")
          }
        } else {
          // Create new material
          const response = await fetch(`${API_URL}/supplier/materials`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              material_name: formData.name,
              description: formData.description,
              quantity_available: Number.parseInt(formData.quantity),
              unit_price: Number.parseFloat(formData.unitPrice),
            }),
          })

          if (response.ok) {
            const newMaterial = await response.json()
            setMaterials([...materials, newMaterial])
            setFormData({ name: "", description: "", quantity: "", unitPrice: "" })
            setError("")
            setSuccess("Material added successfully!")
            setTimeout(() => setSuccess(""), 3000)
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Failed to add material")
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save material")
      }
    }
  }

  const handleEdit = (material: Material) => {
    setEditingId(material.material_id)
    setFormData({
      name: material.material_name,
      description: material.description,
      quantity: material.quantity_available.toString(),
      unitPrice: material.unit_price.toString(),
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ name: "", description: "", quantity: "", unitPrice: "" })
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/supplier/materials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setMaterials(materials.filter((m) => m.material_id !== id))
        setSuccess("Material deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to delete material")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete material")
    }
  }

  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Materials Catalog
            </h1>
            <p className="text-gray-600 mt-2">Manage your raw materials inventory</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading materials...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Add New Material */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingId ? "Edit Raw Material" : "Add New Raw Material"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Material Name</label>
                    <Input
                      placeholder="e.g., Aluminum Sheet"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      placeholder="Brief description of the material"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 w-full p-2 border border-gray-200 rounded-md text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Quantity Available</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Unit Price ($)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleAddMaterial}
                    className="w-full text-white"
                    style={{ backgroundColor: "#018790" }}
                  >
                    {editingId ? "Update Material" : "Create Material"}
                  </Button>
                  {editingId && (
                    <Button
                      onClick={handleCancel}
                      className="w-full"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Right Panel - Material Catalog */}
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Complete Material Catalog</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Material ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Quantity</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Unit Price</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((material) => (
                          <tr key={material.material_id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{material.material_id}</td>
                            <td className="py-3 px-4">{material.material_name}</td>
                            <td className="py-3 px-4">{material.quantity_available} units</td>
                            <td className="py-3 px-4">${material.unit_price.toFixed(2)}</td>
                            <td className="py-3 px-4 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 bg-transparent"
                                onClick={() => handleEdit(material)}
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-red-600 hover:text-red-700 bg-transparent"
                                onClick={() => handleDelete(material.material_id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
