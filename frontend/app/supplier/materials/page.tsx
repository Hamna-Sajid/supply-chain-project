"use client"

import { useState } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2 } from "lucide-react"

interface Material {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  lastUpdated: string
}

const mockMaterials: Material[] = [
  {
    id: "MAT-001",
    name: "Aluminum Sheet",
    description: "High-grade aluminum sheets for manufacturing",
    quantity: 500,
    unitPrice: 45,
    lastUpdated: "2025-01-15",
  },
  {
    id: "MAT-002",
    name: "Copper Wire",
    description: "Pure copper wire for electrical applications",
    quantity: 1000,
    unitPrice: 120,
    lastUpdated: "2025-01-14",
  },
  {
    id: "MAT-003",
    name: "Steel Rod",
    description: "Carbon steel rods for structural use",
    quantity: 300,
    unitPrice: 65,
    lastUpdated: "2025-01-13",
  },
]

export default function MaterialsCatalogPage() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    unitPrice: "",
  })

  const handleAddMaterial = () => {
    if (formData.name && formData.quantity && formData.unitPrice) {
      const newMaterial: Material = {
        id: `MAT-${String(materials.length + 1).padStart(3, "0")}`,
        name: formData.name,
        description: formData.description,
        quantity: Number.parseInt(formData.quantity),
        unitPrice: Number.parseFloat(formData.unitPrice),
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      setMaterials([...materials, newMaterial])
      setFormData({ name: "", description: "", quantity: "", unitPrice: "" })
    }
  }

  const handleDelete = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id))
  }

  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Materials Catalog
            </h1>
            <p className="text-gray-600 mt-2">Manage your raw materials inventory</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Add New Material */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Add New Raw Material</CardTitle>
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
                  Create Material
                </Button>
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
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Last Updated</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material) => (
                        <tr key={material.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{material.id}</td>
                          <td className="py-3 px-4">{material.name}</td>
                          <td className="py-3 px-4">{material.quantity} units</td>
                          <td className="py-3 px-4">${material.unitPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-gray-600">{material.lastUpdated}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button size="sm" variant="outline" className="h-7 bg-transparent">
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleDelete(material.id)}
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
        </div>
      </main>
    </div>
  )
}
