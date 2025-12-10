"use client"

import { useState } from "react"
import { RetailerSidebar } from "@/components/retailer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2 } from "lucide-react"

interface SaleItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface SaleRecord {
  id: string
  date: string
  total: number
  profit: number
}

const inventoryProducts = [
  { id: "INV-001", name: "Wireless Mouse", price: 35 },
  { id: "INV-002", name: "Mechanical Keyboard", price: 89 },
  { id: "INV-003", name: "USB Hub", price: 25 },
  { id: "INV-004", name: "Monitor Stand", price: 45 },
  { id: "INV-005", name: "Desk Lamp", price: 55 },
]

const saleHistory: SaleRecord[] = [
  { id: "SALE-001", date: "2024-01-16", total: 350, profit: 105 },
  { id: "SALE-002", date: "2024-01-15", total: 180, profit: 54 },
  { id: "SALE-003", date: "2024-01-14", total: 520, profit: 156 },
  { id: "SALE-004", date: "2024-01-13", total: 220, profit: 66 },
  { id: "SALE-005", date: "2024-01-12", total: 450, profit: 135 },
]

export default function SalesRegisterPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([])
  const [saleNotes, setSaleNotes] = useState("")
  const [activeTab, setActiveTab] = useState<"pos" | "history">("pos")

  const filteredProducts = inventoryProducts.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm),
  )

  const addItem = (product: (typeof inventoryProducts)[0]) => {
    setSelectedItems((prev) => {
      const existing = prev.find((p) => p.id === product.id)
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p))
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          quantity: 1,
          price: product.price,
        },
      ]
    })
    setSearchTerm("")
  }

  const removeItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((p) => p.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setSelectedItems((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p)))
  }

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="flex">
      <RetailerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Sales Register (POS)
            </h1>
            <p className="text-gray-600 mt-2">Record customer sales and manage transactions</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b">
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "pos"
                  ? "border-b-2 text-[#018790]"
                  : "border-b-2 border-transparent text-gray-600 hover:text-gray-900"
              }`}
              style={activeTab === "pos" ? { borderBottomColor: "#018790" } : {}}
            >
              POS System
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "history"
                  ? "border-b-2 text-[#018790]"
                  : "border-b-2 border-transparent text-gray-600 hover:text-gray-900"
              }`}
              style={activeTab === "history" ? { borderBottomColor: "#018790" } : {}}
            >
              Sales History
            </button>
          </div>

          {activeTab === "pos" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel: Product Search */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm mb-6">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-lg">Find & Add Products</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="relative mb-4">
                      <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search product by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {searchTerm && filteredProducts.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => addItem(product)}
                            className="w-full flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#018790] transition-colors"
                          >
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">${product.price}</span>
                              <Plus size={18} className="text-[#018790]" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Selected Items */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-lg">Selected Items ({selectedItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {selectedItems.length === 0 ? (
                      <p className="text-gray-600 py-8 text-center">No items selected</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">${item.price} each</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  −
                                </Button>
                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <span className="font-semibold w-20 text-right text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:bg-red-50 p-2 rounded"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel: Transaction Summary */}
              <div>
                <Card className="border-0 shadow-sm sticky top-6">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax (10%):</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div
                          className="border-t pt-2 flex justify-between font-bold text-lg"
                          style={{ color: "#005461" }}
                        >
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Sale Notes</label>
                        <textarea
                          value={saleNotes}
                          onChange={(e) => setSaleNotes(e.target.value)}
                          placeholder="Optional notes for this transaction..."
                          className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#018790]"
                          rows={3}
                        />
                      </div>

                      <Button
                        className="w-full text-white py-6 text-lg font-semibold"
                        style={{ backgroundColor: "#018790" }}
                        disabled={selectedItems.length === 0}
                      >
                        Complete Sale & Record Revenue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Sales History Tab */
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Sales History</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Sale ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleHistory.map((sale) => (
                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{sale.id}</td>
                          <td className="py-3 px-4 text-gray-600">{sale.date}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">${sale.total.toFixed(2)}</td>
                          <td className="py-3 px-4 font-semibold text-green-600">${sale.profit.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
