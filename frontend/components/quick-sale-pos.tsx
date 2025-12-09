"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface POSProduct {
  id: string
  product_id: string
  product_name: string
  category: string
  sku: string
  quantity: number
  price?: number
}

interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

export function QuickSalePOS() {
  const [products, setProducts] = useState<POSProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<POSProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<POSProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

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

  // Filter products when search term changes
  useEffect(() => {
    const filtered = products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.includes(searchTerm) ||
        p.product_id.toString().includes(searchTerm),
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const handleSelectProduct = (product: POSProduct) => {
    setSelectedProduct(product)
    setSearchTerm("")
    setQuantity(1)
  }

  const handleCompleteSale = async () => {
    if (!selectedProduct) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const saleItem = {
        product_id: selectedProduct.product_id,
        quantity: quantity,
        price: selectedProduct.price || 0,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retailer/sales`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [saleItem] }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Sale error:", errorText)
        return
      }

      const result = await response.json()
      console.log("Sale recorded:", result)

      // Reset form
      setSelectedProduct(null)
      setQuantity(1)
      setSearchTerm("")
      setCart([])
    } catch (error) {
      console.error("Error completing sale:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm mb-8">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Record New Sale (POS)</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Product Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Select Product</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search product by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>

            {/* Product Dropdown */}
            {searchTerm && !loading && filteredProducts.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.product_id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        Stock: {product.quantity}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchTerm && !loading && filteredProducts.length === 0 && (
              <div className="mt-2 p-4 text-center text-gray-500">No products found</div>
            )}
            {loading && <div className="mt-2 p-4 text-center text-gray-500">Loading products...</div>}
          </div>

          {/* Selected Product Display */}
          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.product_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedProduct.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Stock Available</p>
                  <p className="text-2xl font-bold" style={{ color: "#018790" }}>
                    {selectedProduct.quantity}
                  </p>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-600">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isSubmitting}
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-16 text-center"
                    disabled={isSubmitting}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.min(selectedProduct.quantity, quantity + 1))}
                    disabled={isSubmitting || quantity >= selectedProduct.quantity}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold" style={{ color: "#005461" }}>
                  ${((selectedProduct.price || 0) * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Complete Sale Button */}
          <Button
            className="w-full text-white py-6 text-lg font-semibold"
            style={{ backgroundColor: "#018790" }}
            onClick={handleCompleteSale}
            disabled={!selectedProduct || isSubmitting}
          >
            {isSubmitting ? "Recording..." : "Complete Sale"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
