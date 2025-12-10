"use client"

import { useState, useEffect } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Order {
  order_id: string
  order_status: string
  order_date: string
  total_amount?: number
  manufacturer?: string
  order_items?: Array<{
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
  }>
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
}

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

// Define order status hierarchy (index represents progression)
const ORDER_STATUS_HIERARCHY: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
}

// Get allowed next statuses based on current status
const getAllowedNextStatuses = (currentStatus: string): string[] => {
  const currentLevel = ORDER_STATUS_HIERARCHY[currentStatus.toLowerCase()] ?? 0
  return Object.entries(ORDER_STATUS_HIERARCHY)
    .filter(([_, level]) => level >= currentLevel)
    .map(([status]) => status)
}

export default function ManufacturerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError("")
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
          console.log('Orders data received:', data)
          // Handle both array and object formats
          const ordersData = Array.isArray(data) ? data : (data.orders || [])
          setOrders(ordersData)
        } else {
          const errorData = await response.text()
          console.error(`Error response: ${response.status} - ${errorData}`)
          if (response.status === 403) {
            setError("❌ Access Denied: You are not logged in as a Supplier. Please log in with a supplier account to view supplier orders.")
          } else {
            setError(`Failed to load orders: ${response.status}`)
          }
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/supplier/orders/${selectedOrder.order_id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      })

      if (response.ok) {
        // Update the order in the list
        setOrders(
          orders.map((o) =>
            o.order_id === selectedOrder.order_id ? { ...o, order_status: newStatus.toLowerCase() } : o
          )
        )
        setSelectedOrder({ ...selectedOrder, order_status: newStatus.toLowerCase() })
        setShowStatusModal(false)
        setNewStatus("")
        setSuccess("Order status updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to update order status")
      }
    } catch (err) {
      console.error("Error updating status:", err)
      setError("Error updating order status")
    }
  }

  const filteredOrders = selectedStatus === "all" ? orders : orders.filter((o) => o.order_status.toLowerCase() === selectedStatus.toLowerCase())

  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
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

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
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
                {["all", "pending", "processing", "shipped", "delivered"].map((status) => (
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
                    {capitalizeStatus(status)}
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
                            <tr
                              key={order.order_id}
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <td className="py-3 px-4 font-medium text-blue-600">{order.order_id}</td>
                              <td className="py-3 px-4">{order.manufacturer || "Unknown"}</td>
                              <td className="py-3 px-4">
                                <Badge className={statusColors[order.order_status.toLowerCase()] || "bg-gray-100 text-gray-800"}>
                                  {capitalizeStatus(order.order_status)}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 font-semibold">${(order.total_amount || 0).toLocaleString()}</td>
                              <td className="py-3 px-4 text-gray-600">{new Date(order.order_date).toLocaleDateString()}</td>
                              <td className="py-3 px-4">
                                <Button
                                  size="sm"
                                  style={{ backgroundColor: "#018790", color: "white" }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedOrder(order)
                                    setNewStatus(order.order_status)
                                    setShowStatusModal(true)
                                  }}
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
                            {selectedOrder.order_id}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600">CUSTOMER</p>
                          <p className="font-medium">{selectedOrder.manufacturer || "Unknown"}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600">CURRENT STATUS</p>
                          <Badge className={statusColors[selectedOrder.order_status.toLowerCase()] || "bg-gray-100 text-gray-800"}>
                            {capitalizeStatus(selectedOrder.order_status)}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600">TOTAL AMOUNT</p>
                          <p className="text-xl font-bold text-green-600">${(selectedOrder.total_amount || 0).toLocaleString()}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-600">ORDER DATE</p>
                          <p className="text-sm">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                        </div>

                        {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-2">ORDER ITEMS</p>
                            <div className="bg-gray-50 rounded-md p-3 space-y-3">
                              {selectedOrder.order_items.map((item, index) => (
                                <div key={item.product_id || index} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                      <p className="font-semibold text-gray-800">{item.product_name}</p>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        ID: {item.product_id}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Quantity:</span>
                                      <span className="font-medium">{item.quantity}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Unit Price:</span>
                                      <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-1 border-t border-gray-300">
                                      <span className="text-gray-700 font-medium">Subtotal:</span>
                                      <span className="font-bold text-green-600">
                                        ${(item.quantity * item.unit_price).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Select an order to view details</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Status Update Modal */}
          {showStatusModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md border-0 shadow-lg">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg">Update Order Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Order ID</label>
                    <p className="mt-1 text-gray-900 font-semibold">{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Status</label>
                    <p className="mt-1 text-gray-900">{capitalizeStatus(selectedOrder.order_status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm"
                    >
                      <option value="">Select new status</option>
                      {getAllowedNextStatuses(selectedOrder.order_status).map((status) => (
                        <option key={status} value={status}>
                          {capitalizeStatus(status)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Note: You can only move forward in the order lifecycle</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowStatusModal(false)
                        setNewStatus("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 text-white"
                      style={{ backgroundColor: "#018790" }}
                      onClick={handleUpdateStatus}
                      disabled={!newStatus || newStatus === selectedOrder.order_status}
                    >
                      Update Status
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
