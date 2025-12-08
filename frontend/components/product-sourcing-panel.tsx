"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart } from "lucide-react"

interface WarehouseProduct {
  id: string
  name: string
  price: number
  rating: number
  category: string
  warehouse: string
  stock: number
}

const warehouseProducts: WarehouseProduct[] = [
  {
    id: "WH-001",
    name: "Wireless Mouse",
    price: 35,
    rating: 4.5,
    category: "Electronics",
    warehouse: "NYC Warehouse",
    stock: 150,
  },
  {
    id: "WH-002",
    name: "Mechanical Keyboard",
    price: 89,
    rating: 4.8,
    category: "Electronics",
    warehouse: "NYC Warehouse",
    stock: 80,
  },
  {
    id: "WH-003",
    name: "USB Hub",
    price: 25,
    rating: 4.2,
    category: "Accessories",
    warehouse: "LA Warehouse",
    stock: 200,
  },
  {
    id: "WH-004",
    name: "Monitor Stand",
    price: 45,
    rating: 4.6,
    category: "Furniture",
    warehouse: "Chicago Hub",
    stock: 120,
  },
  {
    id: "WH-005",
    name: "Desk Lamp",
    price: 55,
    rating: 4.4,
    category: "Lighting",
    warehouse: "NYC Warehouse",
    stock: 95,
  },
  {
    id: "WH-006",
    name: "Phone Holder",
    price: 15,
    rating: 4.7,
    category: "Accessories",
    warehouse: "LA Warehouse",
    stock: 300,
  },
]

export function ProductSourcingPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    priceRange: "all",
    rating: "all",
    category: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [cart, setCart] = useState<string[]>([])

  const filteredProducts = warehouseProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.id.includes(searchTerm)

    const matchesPrice =
      filters.priceRange === "all" ||
      (filters.priceRange === "low" && product.price < 50) ||
      (filters.priceRange === "mid" && product.price >= 50 && product.price < 100) ||
      (filters.priceRange === "high" && product.price >= 100)

    const matchesRating =
      filters.rating === "all" ||
      (filters.rating === "4plus" && product.rating >= 4) ||
      (filters.rating === "45plus" && product.rating >= 4.5)

    const matchesCategory = filters.category === "all" || product.category === filters.category

    return matchesSearch && matchesPrice && matchesRating && matchesCategory
  })

  const itemsPerPage = 6
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleCart = (productId: string) => {
    setCart((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Price Range</label>
            <select
              value={filters.priceRange}
              onChange={(e) => {
                setFilters({ ...filters, priceRange: e.target.value })
                setCurrentPage(1)
              }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-2"
            >
              <option value="all">All</option>
              <option value="low">{"< $50"}</option>
              <option value="mid">$50 - $100</option>
              <option value="high">{"> $100"}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => {
                setFilters({ ...filters, rating: e.target.value })
                setCurrentPage(1)
              }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-2"
            >
              <option value="all">All</option>
              <option value="4plus">4.0+</option>
              <option value="45plus">4.5+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value })
                setCurrentPage(1)
              }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-2"
            >
              <option value="all">All</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Furniture">Furniture</option>
              <option value="Lighting">Lighting</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-600">{product.id}</p>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">⭐ {product.rating}</Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">${product.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className="text-sm font-medium text-gray-900">{product.stock} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Warehouse:</span>
                  <span className="text-sm text-gray-900">{product.warehouse}</span>
                </div>
              </div>

              <Button
                className="w-full text-white flex items-center justify-center gap-2"
                style={{
                  backgroundColor: cart.includes(product.id) ? "#005461" : "#018790",
                }}
                onClick={() => toggleCart(product.id)}
              >
                <ShoppingCart size={16} />
                {cart.includes(product.id) ? "Remove from Cart" : "Add to Cart"}
              </Button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
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
      </CardContent>
    </Card>
  )
}
