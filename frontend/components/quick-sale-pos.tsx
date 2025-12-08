"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface POSProduct {
  id: string
  name: string
  price: number
}

const products: POSProduct[] = [
  { id: "PROD-001", name: "Wireless Earbuds", price: 79.99 },
  { id: "PROD-002", name: "Phone Case", price: 29.99 },
  { id: "PROD-003", name: "USB-C Cable", price: 14.99 },
  { id: "PROD-004", name: "Screen Protector", price: 9.99 },
  { id: "PROD-005", name: "Power Bank", price: 49.99 },
]

export function QuickSalePOS() {
  const [selectedProduct, setSelectedProduct] = useState<POSProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm),
  )

  const handleCompleteSale = () => {
    if (!selectedProduct) return
    console.log(`Sale completed: ${quantity}x ${selectedProduct.name}`)
    setSelectedProduct(null)
    setQuantity(1)
    setSearchTerm("")
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
                placeholder="Search product by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Product Dropdown */}
            {searchTerm && filteredProducts.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product)
                      setSearchTerm("")
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-600">${product.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Product Display */}
          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedProduct.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Unit Price</p>
                  <p className="text-2xl font-bold" style={{ color: "#018790" }}>
                    ${selectedProduct.price}
                  </p>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-600">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    −
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-16 text-center"
                  />
                  <Button size="sm" variant="outline" onClick={() => setQuantity(quantity + 1)}>
                    +
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold" style={{ color: "#005461" }}>
                  ${(selectedProduct.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Complete Sale Button */}
          <Button
            className="w-full text-white py-6 text-lg font-semibold"
            style={{ backgroundColor: "#018790" }}
            onClick={handleCompleteSale}
            disabled={!selectedProduct}
          >
            Complete Sale
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
