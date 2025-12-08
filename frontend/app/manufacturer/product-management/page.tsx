"use client"

import { useState } from "react"
import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"

const products = [
  { id: 1, name: "Component A", sku: "COMP-001", stage: "Design", startDate: "2025-01-05", quantity: 1000 },
  { id: 2, name: "Component B", sku: "COMP-002", stage: "Manufacturing", startDate: "2025-01-03", quantity: 500 },
  { id: 3, name: "Assembly Unit", sku: "ASS-001", stage: "Quality Check", startDate: "2024-12-28", quantity: 250 },
]

export default function ProductManagement() {
  const [products_state, setProducts] = useState(products)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", sku: "", stage: "Design", quantity: "" })

  const handleAddProduct = () => {
    if (formData.name && formData.sku && formData.quantity) {
      setProducts([
        ...products_state,
        {
          id: products_state.length + 1,
          name: formData.name,
          sku: formData.sku,
          stage: formData.stage,
          startDate: new Date().toISOString().split("T")[0],
          quantity: Number.parseInt(formData.quantity),
        },
      ])
      setFormData({ name: "", sku: "", stage: "Design", quantity: "" })
      setShowForm(false)
    }
  }

  const handleDeleteProduct = (id: number) => {
    setProducts(products_state.filter((p) => p.id !== id))
  }

  return (
    <div className="flex">
      <ManufacturerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
                Product Management
              </h1>
              <p className="text-gray-600 mt-2">Create and manage product manufacturing</p>
            </div>
            <Button
              style={{ backgroundColor: "#018790" }}
              className="text-white"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={20} className="mr-2" />
              New Product
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Enter SKU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stage</label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option>Design</option>
                      <option>Manufacturing</option>
                      <option>Quality Check</option>
                      <option>Packaging</option>
                      <option>Ready</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button style={{ backgroundColor: "#018790" }} className="text-white" onClick={handleAddProduct}>
                    Add Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Active Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "#E5E7EB" }}>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Product Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        SKU
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Production Stage
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Start Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Quantity
                      </th>
                      <th className="text-center py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products_state.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-100 transition-colors">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">{product.sku}</td>
                        <td className="py-3 px-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: "#018790" }}
                          >
                            {product.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4">{product.startDate}</td>
                        <td className="py-3 px-4">{product.quantity} units</td>
                        <td className="py-3 px-4 text-center">
                          <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 size={16} />
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
      </main>
    </div>
  )
}
