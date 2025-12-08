"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface RawMaterial {
  id: string
  name: string
  price: number
  rating: number
  supplier: string
  type: string
  availability: number
}

const materialsData: RawMaterial[] = [
  {
    id: "MAT-001",
    name: "Aluminum Sheet",
    price: 45,
    rating: 4.5,
    supplier: "Metal Supplies Inc",
    type: "Metal",
    availability: 500,
  },
  {
    id: "MAT-002",
    name: "Copper Wire",
    price: 120,
    rating: 4.8,
    supplier: "Wire Co",
    type: "Metal",
    availability: 1000,
  },
  {
    id: "MAT-003",
    name: "Plastic Resin",
    price: 35,
    rating: 4.2,
    supplier: "Plastic World",
    type: "Plastic",
    availability: 2000,
  },
  {
    id: "MAT-004",
    name: "Rubber Gasket",
    price: 15,
    rating: 4.6,
    supplier: "Seal Corp",
    type: "Rubber",
    availability: 500,
  },
  {
    id: "MAT-005",
    name: "Steel Rod",
    price: 65,
    rating: 4.4,
    supplier: "Steel Works",
    type: "Metal",
    availability: 300,
  },
  {
    id: "MAT-006",
    name: "Silicone Oil",
    price: 80,
    rating: 4.7,
    supplier: "Chemical Plus",
    type: "Chemical",
    availability: 600,
  },
]

export function MaterialSourcingPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    priceRange: "all",
    rating: "all",
    supplier: "all",
    type: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)

  const filteredMaterials = materialsData.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPrice =
      filters.priceRange === "all" ||
      (filters.priceRange === "low" && material.price < 50) ||
      (filters.priceRange === "mid" && material.price >= 50 && material.price < 100) ||
      (filters.priceRange === "high" && material.price >= 100)

    const matchesRating =
      filters.rating === "all" ||
      (filters.rating === "4plus" && material.rating >= 4) ||
      (filters.rating === "45plus" && material.rating >= 4.5)

    const matchesSupplier = filters.supplier === "all" || material.supplier === filters.supplier

    const matchesType = filters.type === "all" || material.type === filters.type

    return matchesSearch && matchesPrice && matchesRating && matchesSupplier && matchesType
  })

  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
  const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Browse Raw Materials</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
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

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <label className="block text-xs font-semibold text-gray-600 mb-2">Supplier</label>
            <select
              value={filters.supplier}
              onChange={(e) => {
                setFilters({ ...filters, supplier: e.target.value })
                setCurrentPage(1)
              }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-2"
            >
              <option value="all">All</option>
              <option value="Metal Supplies Inc">Metal Supplies Inc</option>
              <option value="Wire Co">Wire Co</option>
              <option value="Plastic World">Plastic World</option>
              <option value="Seal Corp">Seal Corp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value })
                setCurrentPage(1)
              }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-2"
            >
              <option value="all">All</option>
              <option value="Metal">Metal</option>
              <option value="Plastic">Plastic</option>
              <option value="Rubber">Rubber</option>
              <option value="Chemical">Chemical</option>
            </select>
          </div>
        </div>

        {/* Materials Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Material</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Supplier</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Available</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMaterials.map((material) => (
                <tr key={material.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{material.name}</td>
                  <td className="py-3 px-4 text-gray-600">{material.supplier}</td>
                  <td className="py-3 px-4">${material.price}</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-yellow-100 text-yellow-800">⭐ {material.rating}</Badge>
                  </td>
                  <td className="py-3 px-4">{material.availability} units</td>
                  <td className="py-3 px-4">
                    <Button size="sm" style={{ backgroundColor: "#018790", color: "white" }}>
                      Place Order
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
