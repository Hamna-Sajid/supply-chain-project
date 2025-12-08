"use client"

import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, CheckCircle, Clock } from "lucide-react"

const shipments = [
  { id: 1, orderId: "ORD-001", destination: "Retail Center A", qty: 500, status: "In Transit", date: "2025-01-07" },
  { id: 2, orderId: "ORD-002", destination: "Distribution Hub B", qty: 300, status: "Delivered", date: "2025-01-06" },
  { id: 3, orderId: "ORD-003", destination: "Warehouse C", qty: 200, status: "Processing", date: "2025-01-08" },
  { id: 4, orderId: "ORD-004", destination: "Regional Store", qty: 150, status: "In Transit", date: "2025-01-08" },
]

export default function WarehouseShipments() {
  return (
    <div className="flex">
      <ManufacturerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Warehouse Shipments
            </h1>
            <p className="text-gray-600 mt-2">Track outbound shipments and logistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold" style={{ color: "#005461" }}>
                  4
                </div>
                <p className="text-xs text-gray-600 mt-1">Total Shipments</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <p className="text-xs text-gray-600 mt-1">In Transit</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">1</div>
                <p className="text-xs text-gray-600 mt-1">Delivered</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        {shipment.status === "Delivered" && <CheckCircle size={24} className="text-green-600" />}
                        {shipment.status === "In Transit" && <Truck size={24} className="text-blue-600" />}
                        {shipment.status === "Processing" && <Clock size={24} className="text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{shipment.orderId}</p>
                        <p className="text-sm text-gray-600">To: {shipment.destination}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {shipment.qty} units | Date: {shipment.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{
                          backgroundColor:
                            shipment.status === "Delivered"
                              ? "#10b981"
                              : shipment.status === "In Transit"
                                ? "#3b82f6"
                                : "#f59e0b",
                        }}
                      >
                        {shipment.status}
                      </span>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
