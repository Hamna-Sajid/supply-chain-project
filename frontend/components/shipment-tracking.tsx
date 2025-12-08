"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Shipment {
  shipment_id: string
  status: string
  expected_delivery_date?: string
  created_at?: string
  products?: {
    product_name: string
    sku: string
  }
  users?: {
    name: string
    address: string
  }
}

const statusColors: Record<string, string> = {
  "in_transit": "bg-blue-100 text-blue-800",
  "preparing": "bg-yellow-100 text-yellow-800",
  "delivered": "bg-green-100 text-green-800",
}

export function ShipmentTracking() {
  const [shipmentsData, setShipmentsData] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        
        if (!token) {
          throw new Error("No authentication token found. Please log in.")
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/shipments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error Response:", errorText)
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()
        // Filter to show only in transit shipments
        const inTransitShipments = (data.shipments || []).filter((s: Shipment) => s.status === "in_transit").slice(0, 3)
        setShipmentsData(inTransitShipments)
        setError(null)
      } catch (err) {
        console.error("Error fetching shipments:", err)
        setError("Failed to load shipments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShipments()
  }, [])

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Shipments In Transit</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

        {isLoading && <div className="text-center py-6 text-gray-500">Loading shipments...</div>}

        {!isLoading && shipmentsData.length === 0 && (
          <div className="text-center py-6 text-gray-500">No shipments in transit</div>
        )}

        {!isLoading && shipmentsData.length > 0 && (
          <div className="space-y-4">
            {shipmentsData.map((shipment) => (
              <div
                key={shipment.shipment_id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">SHIP-{shipment.shipment_id.slice(0, 6)}</span>
                    <Badge className={statusColors[shipment.status] || "bg-gray-100 text-gray-800"}>
                      {formatStatus(shipment.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    To: {shipment.users?.name || "Unknown Warehouse"} | {shipment.products?.product_name || "Unknown Product"}
                  </p>
                  <div className="flex gap-6 mt-2 text-xs text-gray-500">
                    <span>Started: {shipment.created_at ? new Date(shipment.created_at).toLocaleDateString() : "N/A"}</span>
                    <span>
                      ETA: {shipment.expected_delivery_date ? new Date(shipment.expected_delivery_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
                <span className="text-2xl">📍</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
