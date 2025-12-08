"use client"

import { useState, useEffect } from "react"
import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"

interface Product {
  product_id: string
  product_name: string
  sku: string
  production_stage: string
  quantity: number
  created_at?: string
}

export default function ProductManagement() {
  const [products_state, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", sku: "", stage: "Design", quantity: "" })

  // Fetch products on component load
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data.products || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err.message : "Error loading products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProduct = async () => {
    if (!formData.name || !formData.sku || !formData.quantity) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: formData.name,
          sku: formData.sku,
          production_stage: formData.stage,
          quantity: Number.parseInt(formData.quantity),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create product")
      }

      setFormData({ name: "", sku: "", stage: "Design", quantity: "" })
      setShowForm(false)
      setError(null)
      await fetchProducts()
    } catch (err) {
      console.error("Error adding product:", err)
      setError(err instanceof Error ? err.message : "Error creating product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      setProducts(products_state.filter((p) => p.product_id !== id))
      setError(null)
    } catch (err) {
      console.error("Error deleting product:", err)
      setError(err instanceof Error ? err.message : "Error deleting product")
    }
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

          {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

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
                  <Button
                    style={{ backgroundColor: "#018790" }}
                    className="text-white"
                    onClick={handleAddProduct}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Add Product"}
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
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading products...</div>
              ) : products_state.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No products found. Create your first product!</div>
              ) : (
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
                          Quantity
                        </th>
                        <th className="text-center py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products_state.map((product) => (
                        <tr key={product.product_id} className="border-b hover:bg-gray-100 transition-colors">
                          <td className="py-3 px-4 font-medium">{product.product_name}</td>
                          <td className="py-3 px-4">{product.sku}</td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: "#018790" }}
                            >
                              {product.production_stage}
                            </span>
                          </td>
                          <td className="py-3 px-4">{product.quantity} units</td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.product_id)}
                            >
                              <Trash2 size={16} />
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
        </div>
      </main>
    </div>
  )
}
