"use client"

import { useState } from "react"
import { RetailerSidebar } from "@/components/retailer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Star } from "lucide-react"

interface CatalogProduct {
  id: string
  name: string
  sellingPrice: number
  warehouse: string
  stock: number
  category: string
  rating: number
}

const catalogProducts: CatalogProduct[] = [
  {
    id: "CAT-001",
    name: "Wireless Mouse",
    sellingPrice: 35,
    warehouse: "NYC Warehouse",
    stock: 150,
    category: "Electronics",
    rating: 4.5,
  },
  {
    id: "CAT-002",
    name: "Mechanical Keyboard",
    sellingPrice: 89,
    warehouse: "NYC Warehouse",
    stock: 80,
    category: "Electronics",
    rating: 4.8,
  },
  {
    id: "CAT-003",
    name: "USB Hub",
    sellingPrice: 25,
    warehouse: "LA Warehouse",
    stock: 200,
    category: "Accessories",
    rating: 4.2,
  },
  {
    id: "CAT-004",
    name: "Monitor Stand",
    sellingPrice: 45,
    warehouse: "Chicago Hub",
    stock: 120,
    category: "Furniture",
    rating: 4.6,
  },
  {
    id: "CAT-005",
    name: "Desk Lamp",
    sellingPrice: 55,
    warehouse: "NYC Warehouse",
    stock: 95,
    category: "Lighting",
    rating: 4.4,
  },
  {
    id: "CAT-006",
    name: "Phone Holder",
    sellingPrice: 15,
    warehouse: "LA Warehouse",
    stock: 300,
    category: "Accessories",
    rating: 4.7,
  },
]

export default function ProductCatalogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [warehouse, setWarehouse] = useState("all")
  const [category, setCategory] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [rating, setRating] = useState("all")
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([])

  const filteredProducts = catalogProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesWarehouse = warehouse === "all" || product.warehouse === warehouse
    const matchesCategory = category === "all" || product.category === category
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "low" && product.sellingPrice < 30) ||
      (priceRange === "mid" && product.sellingPrice >= 30 && product.sellingPrice < 70) ||
      (priceRange === "high" && product.sellingPrice >= 70)
    const matchesRating =
      rating === "all" || (rating === "4plus" && product.rating >= 4) || (rating === "45plus" && product.rating >= 4.5)

    return matchesSearch && matchesWarehouse && matchesCategory && matchesPrice && matchesRating
  })

  const cartTotal = cart.reduce((sum, item) => {
    const product = catalogProducts.find((p) => p.id === item.id)
    return sum + (product ? product.sellingPrice * item.quantity : 0)
  }, 0)

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === productId)
      if (existing) {
        return prev.map((p) => (p.id === productId ? { ...p, quantity: p.quantity + 1 } : p))
      }
      return [...prev, { id: productId, quantity: 1 }]
    })
  }

  return (
    <div className="flex">
      <RetailerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Product Catalog
            </h1>
            <p className="text-gray-600 mt-2">Browse and order products from warehouses</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Search and Filters */}
              <Card className="border-0 shadow-sm mb-6">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Warehouse</label>
                        <select
                          value={warehouse}
                          onChange={(e) => setWarehouse(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded px-3 py-2"
                        >
                          <option value="all">All Warehouses</option>
                          <option value="NYC Warehouse">NYC Warehouse</option>
                          <option value="LA Warehouse">LA Warehouse</option>
                          <option value="Chicago Hub">Chicago Hub</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded px-3 py-2"
                        >
                          <option value="all">All Categories</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Furniture">Furniture</option>
                          <option value="Lighting">Lighting</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Price Range</label>
                        <select
                          value={priceRange}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded px-3 py-2"
                        >
                          <option value="all">All Prices</option>
                          <option value="low">Under $30</option>
                          <option value="mid">$30 - $70</option>
                          <option value="high">$70+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Rating</label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded px-3 py-2"
                        >
                          <option value="all">All Ratings</option>
                          <option value="4plus">4.0+</option>
                          <option value="45plus">4.5+</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Grid */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Available Products ({filteredProducts.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-gray-600">{product.id}</p>
                            <p className="text-lg font-semibold text-gray-900">{product.name}</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <Star size={14} fill="currentColor" />
                            {product.rating}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Selling Price:</span>
                            <span className="font-semibold text-gray-900">${product.sellingPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Warehouse:</span>
                            <span className="text-gray-900">{product.warehouse}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock Available:</span>
                            <span
                              className={`font-semibold ${product.stock > 50 ? "text-green-600" : "text-orange-600"}`}
                            >
                              {product.stock} units
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="text-gray-900">{product.category}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full text-white flex items-center justify-center gap-2"
                          style={{ backgroundColor: "#018790" }}
                          onClick={() => addToCart(product.id)}
                        >
                          <ShoppingCart size={18} />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm sticky top-6">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-gray-600 text-sm">No items in cart</p>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {cart.map((item) => {
                            const product = catalogProducts.find((p) => p.id === item.id)
                            return (
                              <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{product?.name}</p>
                                  <p className="text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-gray-900">
                                  ${((product?.sellingPrice || 0) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            )
                          })}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between text-lg font-bold" style={{ color: "#005461" }}>
                            <span>Total:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      className="w-full text-white py-6 text-lg font-semibold"
                      style={{ backgroundColor: "#018790" }}
                      disabled={cart.length === 0}
                    >
                      Checkout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
