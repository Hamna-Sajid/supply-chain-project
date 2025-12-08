"use client"

import type React from "react"

import { useState } from "react"
import { RetailerSidebar } from "@/components/retailer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ReturnRecord {
  id: string
  originalOrderId: string
  productName: string
  quantity: number
  returnReason: string
  status: "Pending" | "Approved" | "Processed"
  dateInitiated: string
}

const returnHistory: ReturnRecord[] = [
  {
    id: "RET-001",
    originalOrderId: "ORD-2024-001",
    productName: "Wireless Mouse",
    quantity: 2,
    returnReason: "Defective after 3 days",
    status: "Pending",
    dateInitiated: "2024-01-16",
  },
  {
    id: "RET-002",
    originalOrderId: "ORD-2024-002",
    productName: "USB Hub",
    quantity: 1,
    returnReason: "Wrong color ordered",
    status: "Approved",
    dateInitiated: "2024-01-15",
  },
  {
    id: "RET-003",
    originalOrderId: "ORD-2024-003",
    productName: "Monitor Stand",
    quantity: 1,
    returnReason: "Damaged packaging",
    status: "Processed",
    dateInitiated: "2024-01-14",
  },
]

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-blue-100 text-blue-800",
  Processed: "bg-green-100 text-green-800",
}

export default function ReturnsManagementPage() {
  const [activeTab, setActiveTab] = useState<"initiate" | "history">("initiate")
  const [formData, setFormData] = useState({
    orderIdOrSaleId: "",
    product: "",
    quantity: "",
    reason: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    console.log("Processing return:", formData)
    setFormData({ orderIdOrSaleId: "", product: "", quantity: "", reason: "" })
  }

  return (
    <div className="flex">
      <RetailerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Returns Management
            </h1>
            <p className="text-gray-600 mt-2">Process customer returns and initiate manufacturer returns</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b">
            <button
              onClick={() => setActiveTab("initiate")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "initiate"
                  ? "border-b-2 text-[#018790]"
                  : "border-b-2 border-transparent text-gray-600 hover:text-gray-900"
              }`}
              style={activeTab === "initiate" ? { borderBottomColor: "#018790" } : {}}
            >
              Initiate New Return
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
              Return History
            </button>
          </div>

          {activeTab === "initiate" ? (
            /* Initiate New Return Tab */
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Record Customer Return</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="max-w-2xl space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Original Sale ID or Order ID
                    </label>
                    <Input
                      name="orderIdOrSaleId"
                      value={formData.orderIdOrSaleId}
                      onChange={handleInputChange}
                      placeholder="e.g., ORD-2024-001 or SALE-001"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Product</label>
                    <select
                      name="product"
                      value={formData.product}
                      onChange={handleInputChange}
                      className="w-full text-sm border border-gray-200 rounded px-3 py-2"
                    >
                      <option value="">Select Product</option>
                      <option value="Wireless Mouse">Wireless Mouse</option>
                      <option value="USB Hub">USB Hub</option>
                      <option value="Monitor Stand">Monitor Stand</option>
                      <option value="Desk Lamp">Desk Lamp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Return Quantity</label>
                    <Input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="e.g., 2"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Return Reason</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Describe the reason for return..."
                      rows={4}
                      className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#018790]"
                    />
                  </div>

                  <Button
                    className="w-full text-white py-6 text-lg font-semibold"
                    style={{ backgroundColor: "#018790" }}
                    onClick={handleSubmit}
                  >
                    Process Return
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Return History Tab */
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Processed Returns</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Return ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Original Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Product Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantity</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Return Reason</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnHistory.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{record.id}</td>
                          <td className="py-3 px-4 text-gray-600">{record.originalOrderId}</td>
                          <td className="py-3 px-4 text-gray-900">{record.productName}</td>
                          <td className="py-3 px-4 text-gray-900">{record.quantity}</td>
                          <td className="py-3 px-4 text-gray-600">{record.returnReason}</td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[record.status]}>{record.status}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            {record.status === "Approved" && (
                              <Button size="sm" style={{ backgroundColor: "#018790", color: "white" }}>
                                Initiate Refund
                              </Button>
                            )}
                          </td>
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
