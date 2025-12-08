"use client"

import { useState } from "react"
import { WarehouseSidebar } from "@/components/warehouse-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface IncomingShipment {
  id: string
  manufacturer: string
  manufacturerRating: number
  expectedDate: string
  product: string
  quantity: number
  status: "In Transit" | "Delayed" | "Expected Today"
}

const incomingShipmentsData: IncomingShipment[] = [
  {
    id: "US-W1-001",
    manufacturer: "ABC Manufacturing",
    manufacturerRating: 4.5,
    expectedDate: "2024-01-18",
    product: "Steel Components",
    quantity: 500,
    status: "Expected Today",
  },
  {
    id: "US-W1-002",
    manufacturer: "Tech Supplies Inc",
    manufacturerRating: 4.2,
    expectedDate: "2024-01-19",
    product: "Electronic Parts",
    quantity: 300,
    status: "In Transit",
  },
  {
    id: "US-W1-003",
    manufacturer: "Global Parts Ltd",
    manufacturerRating: 3.8,
    expectedDate: "2024-01-22",
    product: "Plastic Frames",
    quantity: 1000,
    status: "Delayed",
  },
  {
    id: "US-W1-004",
    manufacturer: "Quality Producers",
    manufacturerRating: 4.7,
    expectedDate: "2024-01-20",
    product: "Aluminum Profiles",
    quantity: 750,
    status: "In Transit",
  },
]

const statusColors = {
  "In Transit": "bg-blue-100 text-blue-800",
  Delayed: "bg-red-100 text-red-800",
  "Expected Today": "bg-green-100 text-green-800",
}

export default function IncomingShipmentsPage() {
  const [filter, setFilter] = useState<"all" | "In Transit" | "Delayed" | "Expected Today">("all")

  const filteredShipments =
    filter === "all" ? incomingShipmentsData : incomingShipmentsData.filter((s) => s.status === filter)

  return (
    <div className="flex">
      <WarehouseSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Incoming Shipments
            </h1>
            <p className="text-gray-600 mt-2">Manage shipment reception from manufacturers</p>
          </div>

          {/* Status Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {["all", "In Transit", "Delayed", "Expected Today"].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`${filter === status ? "text-white" : "text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                style={{
                  backgroundColor: filter === status ? "#018790" : "transparent",
                }}
                variant={filter === status ? "default" : "outline"}
              >
                {status === "all" ? "All Shipments" : status}
              </Button>
            ))}
          </div>

          {/* Shipments Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Shipments Awaiting Reception (For This Warehouse)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Shipment ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Manufacturer Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Rating</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Expected Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((shipment) => (
                      <tr key={shipment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{shipment.id}</td>
                        <td className="py-3 px-4 text-gray-700">{shipment.manufacturer}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < Math.floor(shipment.manufacturerRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">{shipment.manufacturerRating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{shipment.expectedDate}</td>
                        <td className="py-3 px-4 text-gray-700">{shipment.product}</td>
                        <td className="py-3 px-4 text-gray-700">{shipment.quantity} units</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[shipment.status]}>{shipment.status}</Badge>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <Button
                            size="sm"
                            style={{ backgroundColor: "#018790", color: "white" }}
                            onClick={() => console.log(`Accept ${shipment.id}`)}
                          >
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => console.log(`Reject ${shipment.id}`)}>
                            Reject
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
