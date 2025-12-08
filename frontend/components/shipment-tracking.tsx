import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Shipment {
  id: string
  destination: string
  status: "In Transit" | "Pending" | "Delivered"
  departureDate: string
  eta: string
}

const shipmentsData: Shipment[] = [
  { id: "SHIP-001", destination: "New York Hub", status: "In Transit", departureDate: "2024-01-15", eta: "2024-01-18" },
  {
    id: "SHIP-002",
    destination: "Chicago Center",
    status: "In Transit",
    departureDate: "2024-01-16",
    eta: "2024-01-20",
  },
  { id: "SHIP-003", destination: "LA Distribution", status: "Pending", departureDate: "2024-01-17", eta: "2024-01-22" },
]

const statusColors = {
  "In Transit": "bg-blue-100 text-blue-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Delivered: "bg-green-100 text-green-800",
}

export function ShipmentTracking() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Shipments In Transit</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {shipmentsData.map((shipment) => (
            <div
              key={shipment.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900">{shipment.id}</span>
                  <Badge className={statusColors[shipment.status]}>{shipment.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">{shipment.destination}</p>
                <div className="flex gap-6 mt-2 text-xs text-gray-500">
                  <span>Departed: {shipment.departureDate}</span>
                  <span>ETA: {shipment.eta}</span>
                </div>
              </div>
              <span className="text-2xl">📍</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
