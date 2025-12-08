"use client"

import { useState } from "react"
import { WarehouseSidebar } from "@/components/warehouse-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RetailerOrder {
  id: string
  retailer: string
  itemCount: number
  totalValue: number
  orderDate: string
  status: "Pending" | "Processing" | "Ready for Shipment"
}

const retailerOrdersData: RetailerOrder[] = [
  {
    id: "RO-2024-001",
    retailer: "RetailHub Express",
    itemCount: 125,
    totalValue: 4500,
    orderDate: "2024-01-17",
    status: "Pending",
  },
  {
    id: "RO-2024-002",
    retailer: "Quick Commerce Co",
    itemCount: 89,
    totalValue: 3200,
    orderDate: "2024-01-16",
    status: "Processing",
  },
  {
    id: "RO-2024-003",
    retailer: "Premium Retail",
    itemCount: 156,
    totalValue: 5800,
    orderDate: "2024-01-16",
    status: "Ready for Shipment",
  },
  {
    id: "RO-2024-004",
    retailer: "Metro Shopping",
    itemCount: 200,
    totalValue: 7200,
    orderDate: "2024-01-15",
    status: "Processing",
  },
]

const statusColors = {
  Pending: "bg-gray-100 text-gray-800",
  Processing: "bg-blue-100 text-blue-800",
  "Ready for Shipment": "bg-green-100 text-green-800",
}

export default function RetailerOrdersPage() {
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredOrders =
    filterStatus === "all" ? retailerOrdersData : retailerOrdersData.filter((o) => o.status === filterStatus)

  return (
    <div className="flex">
      <WarehouseSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Retailer Order Fulfillment
            </h1>
            <p className="text-gray-600 mt-2">Manage and fulfill retailer orders</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                  {retailerOrdersData.filter((o) => o.status === "Pending").length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#018790" }}>
                  {retailerOrdersData.filter((o) => o.status === "Processing").length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Currently processing</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Ready to Ship</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {retailerOrdersData.filter((o) => o.status === "Ready for Shipment").length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Ready for dispatch</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {["all", "Pending", "Processing", "Ready for Shipment"].map((status) => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`${
                  filterStatus === status ? "text-white" : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor: filterStatus === status ? "#018790" : "transparent",
                }}
                variant={filterStatus === status ? "default" : "outline"}
              >
                {status === "all" ? "All Orders" : status}
              </Button>
            ))}
          </div>

          {/* Orders Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Retailer Orders</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Retailer Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Item Count</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Total Value</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Order Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                        <td className="py-3 px-4 text-gray-700">{order.retailer}</td>
                        <td className="py-3 px-4 text-gray-700">{order.itemCount} units</td>
                        <td className="py-3 px-4 font-semibold text-gray-900">${order.totalValue.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-700">{order.orderDate}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[order.status]}>{order.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            style={{ backgroundColor: "#018790", color: "white" }}
                            onClick={() => console.log(`Process ${order.id}`)}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
