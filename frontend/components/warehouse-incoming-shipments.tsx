"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface IncomingShipment {
  id: string
  manufacturer: string
  expectedDate: string
  currentStatus: "Pending" | "In Transit" | "Arriving Soon"
}

const incomingShipmentsData: IncomingShipment[] = [
  { id: "US-W1-001", manufacturer: "ABC Manufacturing", expectedDate: "2024-01-18", currentStatus: "Arriving Soon" },
  { id: "US-W1-002", manufacturer: "Tech Supplies Inc", expectedDate: "2024-01-19", currentStatus: "In Transit" },
  { id: "US-W1-003", manufacturer: "Global Parts Ltd", expectedDate: "2024-01-20", currentStatus: "Pending" },
  { id: "US-W1-004", manufacturer: "Quality Producers", expectedDate: "2024-01-21", currentStatus: "Pending" },
]

const statusColors = {
  Pending: "bg-gray-100 text-gray-800",
  "In Transit": "bg-blue-100 text-blue-800",
  "Arriving Soon": "bg-green-100 text-green-800",
}

export function WarehouseIncomingShipments() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Pending Deliveries (US-W1)</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Shipment ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Manufacturer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Expected Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomingShipmentsData.map((shipment) => (
                <tr key={shipment.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{shipment.id}</td>
                  <td className="py-3 px-4 text-gray-700">{shipment.manufacturer}</td>
                  <td className="py-3 px-4 text-gray-700">{shipment.expectedDate}</td>
                  <td className="py-3 px-4">
                    <Badge className={statusColors[shipment.currentStatus]}>{shipment.currentStatus}</Badge>
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
  )
}
