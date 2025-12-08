"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart } from "lucide-react"

interface Product {
  id: string
  product_id: string
  product_name: string
  category: string
  sku: string
  quantity: number
  price?: number
}

interface OrderItem {
  product_id: string
  quantity: number
}

export function ProductSourcingPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retailer/products`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          return
        }

        const data = await response.json()
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products when search or filters change
  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.includes(searchTerm) ||
        product.product_id.toString().includes(searchTerm)

      const matchesCategory = filters.category === "all" || product.category === filters.category

      return matchesSearch && matchesCategory
    })

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [searchTerm, filters, products])

  const itemsPerPage = 6
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleCart = (productId: string, quantity: number = 1) => {
    const newCart = new Map(cart)
    if (newCart.has(productId)) {
      newCart.delete(productId)
    } else {
      newCart.set(productId, quantity)
    }
    setCart(newCart)
  }

  const handlePlaceOrder = async () => {
    if (cart.size === 0) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const items = Array.from(cart.entries()).map(([productId, quantity]) => ({
        product_id: productId,
        quantity: quantity,
      }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retailer/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items,
          shipping_address: "Store Location",
          warehouse_id: 1,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Order error:", errorText)
        return
      }

      const result = await response.json()
      console.log("Order placed:", result)
      setCart(new Map())
    } catch (error) {
      console.error("Error placing order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = ["all", ...new Set(products.map((p) => p.category))]

  return (
    <Card className="border-0 shadow-sm mb-8">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Order Products from Warehouse</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => {
              setFilters({ ...filters, category: e.target.value })
              setCurrentPage(1)
            }}
            className="w-full text-sm border border-gray-200 rounded px-2 py-2"
            disabled={loading}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading products...</div>
        ) : paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-600">{product.sku}</p>
                      <p className="font-semibold text-gray-900">{product.product_name}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">{product.category}</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <span className="text-sm font-medium text-gray-900">{product.quantity} units</span>
                    </div>
                  </div>

                  <Button
                    className="w-full text-white flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: cart.has(product.product_id) ? "#005461" : "#018790",
                    }}
                    onClick={() => toggleCart(product.product_id, 1)}
                    disabled={isSubmitting}
                  >
                    <ShoppingCart size={16} />
                    {cart.has(product.product_id) ? "Remove" : "Add to Order"}
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-gray-600">
                Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
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
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                    style={
                      currentPage === i + 1
                        ? { backgroundColor: "#018790", color: "white", borderColor: "#018790" }
                        : {}
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

            {/* Cart Summary and Place Order */}
            {cart.size > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-blue-900">
                    Items in order: {cart.size} · Ready to submit
                  </p>
                </div>
                <Button
                  className="w-full text-white py-6 text-lg font-semibold"
                  style={{ backgroundColor: "#018790" }}
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No products found</div>
        )}
      </CardContent>
    </Card>
  )
}
