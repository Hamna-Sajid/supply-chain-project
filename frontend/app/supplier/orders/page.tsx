"use client"

import { useState, useEffect } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Order {
  id: string
  manufacturer_name: string
  status: string
  total_amount: number
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
}

export default function ManufacturerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        const response = await fetch(`${API_URL}/supplier/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        } else {
          setError("Failed to load orders")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = selectedStatus === "all" ? orders : orders.filter((o) => o.status.toLowerCase() === selectedStatus.toLowerCase())

  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Manufacturer Orders
            </h1>
            <p className="text-gray-600 mt-2">Manage incoming purchase orders</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : (
            <>
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["all", "Pending", "Processing", "Shipped", "Delivered"].map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
                    onClick={() => setSelectedStatus(status)}
                    style={
                      selectedStatus === status
                        ? { backgroundColor: "#018790", color: "white", borderColor: "#018790" }
                        : {}
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders Table */}
                <Card className="lg:col-span-2 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Incoming Purchase Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Order ID</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Total Amount</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Order Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50 cursor-pointer">
                              <td className="py-3 px-4 font-medium text-blue-600">{order.id}</td>
                              <td className="py-3 px-4">{order.manufacturer_name}</td>
                              <td className="py-3 px-4">
                                <Badge className={statusColors[order.status.toLowerCase()] || "bg-gray-100 text-gray-800"}>
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 font-semibold">${order.total_amount.toLocaleString()}</td>
                              <td className="py-3 px-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                              <td className="py-3 px-4">
                                <Button
                                  size="sm"
                                  style={{ backgroundColor: "#018790", color: "white" }}
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Update Status
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Details Panel */}
                <Card className="border-0 shadow-sm h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-600">ORDER ID</p>
                          <p className="text-lg font-bold" style={{ color: "#005461" }}>
                            {selectedOrder.id}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600">CUSTOMER</p>
                          <p className="font-medium">{selectedOrder.manufacturer_name}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600">CURRENT STATUS</p>
                          <Badge className={statusColors[selectedOrder.status.toLowerCase()] || "bg-gray-100 text-gray-800"}>
                            {selectedOrder.status}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600">TOTAL AMOUNT</p>
                          <p className="text-xl font-bold text-green-600">${selectedOrder.total_amount.toLocaleString()}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600">ORDER DATE</p>
                          <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Select an order to view details</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
