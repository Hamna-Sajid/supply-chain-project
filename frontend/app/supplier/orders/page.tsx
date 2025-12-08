"use client"

import { useState } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  manufacturer: string
  status: "Pending" | "Processing" | "Shipped" | "Delivered"
  totalAmount: number
  orderDate: string
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    manufacturer: "ABC Manufacturing",
    status: "Pending",
    totalAmount: 12500,
    orderDate: "2025-01-15",
  },
  {
    id: "ORD-002",
    manufacturer: "XYZ Industries",
    status: "Processing",
    totalAmount: 8900,
    orderDate: "2025-01-14",
  },
  {
    id: "ORD-003",
    manufacturer: "Tech Solutions",
    status: "Shipped",
    totalAmount: 15300,
    orderDate: "2025-01-13",
  },
  {
    id: "ORD-004",
    manufacturer: "Prime Corp",
    status: "Delivered",
    totalAmount: 11200,
    orderDate: "2025-01-12",
  },
  {
    id: "ORD-005",
    manufacturer: "Global Suppliers",
    status: "Pending",
    totalAmount: 9800,
    orderDate: "2025-01-11",
  },
]

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
}

export default function ManufacturerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = selectedStatus === "all" ? orders : orders.filter((o) => o.status === selectedStatus)

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o)))
    setSelectedOrder(null)
  }

  const getNextStatus = (current: Order["status"]): Order["status"][] => {
    const progression = {
      Pending: ["Processing", "Cancelled"],
      Processing: ["Shipped", "Pending"],
      Shipped: ["Delivered", "Processing"],
      Delivered: ["Delivered"],
    }
    return progression[current]
  }

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
                          <td className="py-3 px-4">{order.manufacturer}</td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">${order.totalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-gray-600">{order.orderDate}</td>
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
                      <p className="font-medium">{selectedOrder.manufacturer}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600">CURRENT STATUS</p>
                      <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600">TOTAL AMOUNT</p>
                      <p className="text-xl font-bold text-green-600">${selectedOrder.totalAmount.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600">ORDER DATE</p>
                      <p className="text-sm">{selectedOrder.orderDate}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">NEXT STATUS</p>
                      <div className="space-y-2">
                        {getNextStatus(selectedOrder.status).map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            className="w-full"
                            style={{ backgroundColor: "#018790", color: "white" }}
                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                          >
                            Mark as {status}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Select an order to view details</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
