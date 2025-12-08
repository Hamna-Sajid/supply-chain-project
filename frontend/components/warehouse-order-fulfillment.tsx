"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RetailerOrder {
  id: string
  retailer: string
  itemCount: number
  totalValue: number
  orderDate: string
}

export function WarehouseOrderFulfillment() {
  const [orders, setOrders] = useState<RetailerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouse/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()
        // API returns { orders: [...] }
        const ordersList = data.orders && Array.isArray(data.orders) ? data.orders : [];
        setOrders(ordersList)
        setError(null)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleProcessOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouse/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "shipped" }),
      })

      if (response.ok) {
        setOrders(orders.filter(o => o.id !== orderId))
      } else {
        setError("Failed to process order")
      }
    } catch (err) {
      setError("Error processing order")
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">New Retailer Orders</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
        {loading && <div className="text-center py-6 text-gray-500">Loading orders...</div>}
        {!loading && orders.length === 0 && <div className="text-center py-6 text-gray-500">No pending orders</div>}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{order.id}</span>
                    <Badge className="bg-purple-100 text-purple-800">New Order</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Retailer</p>
                      <p className="font-medium text-gray-900">{order.retailer}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Value</p>
                      <p className="font-medium text-gray-900">${order.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <Button
                  style={{ backgroundColor: "#018790", color: "white" }}
                  onClick={() => handleProcessOrder(order.id)}
                >
                  Start Processing
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
