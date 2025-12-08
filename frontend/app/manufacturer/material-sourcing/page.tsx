"use client"

import { useState } from "react"
import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, ShoppingCart } from "lucide-react"

const materials = [
  { id: 1, name: "Steel Sheets", supplier: "Steel Co.", rating: 4.8, price: 250, quantity: 500 },
  { id: 2, name: "Aluminum Bars", supplier: "Aluminum Plus", rating: 4.5, price: 180, quantity: 300 },
  { id: 3, name: "Plastic Pellets", supplier: "Polymer Inc.", rating: 4.2, price: 95, quantity: 1000 },
  { id: 4, name: "Copper Wire", supplier: "Electrical Supply", rating: 4.9, price: 320, quantity: 200 },
  { id: 5, name: "Rubber Components", supplier: "Elastomer Corp", rating: 4.3, price: 45, quantity: 800 },
]

export default function MaterialSourcing() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [orderQuantity, setOrderQuantity] = useState("")
  const [showOrderModal, setShowOrderModal] = useState(false)

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePlaceOrder = () => {
    setShowOrderModal(true)
  }

  return (
    <div className="flex">
      <ManufacturerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Material Sourcing
            </h1>
            <p className="text-gray-600 mt-2">Search and order raw materials from suppliers</p>
          </div>

          <Card className="mb-6 border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Search Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by material name or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Available Raw Materials (All Suppliers)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "#E5E7EB" }}>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Material Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Supplier
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Rating
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Unit Price
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Available Qty
                      </th>
                      <th className="text-center py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((material) => (
                      <tr key={material.id} className="border-b hover:bg-gray-100 transition-colors">
                        <td className="py-3 px-4">{material.name}</td>
                        <td className="py-3 px-4">{material.supplier}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {material.rating}
                            <Star size={14} fill="#018790" color="#018790" />
                          </div>
                        </td>
                        <td className="py-3 px-4">${material.price}</td>
                        <td className="py-3 px-4">{material.quantity} units</td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            style={{ backgroundColor: "#018790" }}
                            className="text-white hover:opacity-90"
                            onClick={() => {
                              setSelectedMaterial(material)
                              handlePlaceOrder()
                            }}
                          >
                            <ShoppingCart size={16} className="mr-1" />
                            Order
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {showOrderModal && selectedMaterial && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Place Order - {selectedMaterial.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Shipping Address</label>
                    <Input
                      type="text"
                      placeholder="Manufacturer Address"
                      defaultValue="123 Industrial Avenue, Manufacturing City, MC 12345"
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowOrderModal(false)
                        setSelectedMaterial(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button style={{ backgroundColor: "#018790" }} className="text-white">
                      Confirm Order
                    </Button>
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
