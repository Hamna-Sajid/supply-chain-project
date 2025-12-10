"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  order_id: string
  order_status: string
  order_date: string
  total_amount: number
  users?: {
    name: string
  }
  order_items?: OrderItem[]
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

export function ManufacturerOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please log in again")
        return
      }

      const response = await fetch(`${API_URL}/manufacturer/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        const errorData = await response.text()
        console.error(`Error response: ${response.status} - ${errorData}`)
        setError(`Failed to load orders: ${response.status}`)
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.order_status === 'pending').length,
      processing: orders.filter(o => o.order_status === 'processing').length,
      shipped: orders.filter(o => o.order_status === 'shipped').length,
      delivered: orders.filter(o => o.order_status === 'delivered').length,
    }
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: "#005461" }}>
                {stats.total}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total Orders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
              <p className="text-xs text-gray-600 mt-1">Processing</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.shipped}</p>
              <p className="text-xs text-gray-600 mt-1">Shipped</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-xs text-gray-600 mt-1">Delivered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Supplier</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Product ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Product Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.order_id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="py-3 px-4 font-medium text-blue-600">{order.order_id}</td>
                        <td className="py-3 px-4">{order.users?.name || "Unknown"}</td>
                        <td className="py-3 px-4">
                          {order.order_items && order.order_items.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {order.order_items.map((item, idx) => (
                                <span key={idx} className="text-xs">{item.product_id}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {order.order_items && order.order_items.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {order.order_items.map((item, idx) => (
                                <span key={idx} className="text-xs">{item.product_name || 'N/A'}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {order.order_items && order.order_items.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {order.order_items.map((item, idx) => (
                                <span key={idx} className="text-xs">{item.quantity}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[order.order_status.toLowerCase()] || "bg-gray-100 text-gray-800"}>
                            {capitalizeStatus(order.order_status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold">${(order.total_amount || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  <p className="text-xs font-semibold text-gray-600">SUPPLIER</p>
                  <p className="font-medium">{selectedOrder.users?.name || "Unknown"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600">STATUS</p>
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
                    <p className="text-xs font-semibold text-gray-600 mb-2">ITEMS</p>
                    <div className="bg-gray-50 rounded-md p-3 space-y-2">
                      {selectedOrder.order_items.map((item) => (
                        <div key={item.product_id} className="text-sm border-b pb-2 last:border-b-0">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-gray-600">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
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
    </div>
  )
}
