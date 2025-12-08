"use client"

import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface Shipment {
  shipment_id: string
  warehouse_id: string
  product_id: string
  quantity: number
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

export default function WarehouseShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/shipments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch shipments")
        }

        const data = await response.json()
        setShipments(data.shipments || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching shipments:", err)
        setError(err instanceof Error ? err.message : "Error loading shipments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShipments()
  }, [])

  const totalShipments = shipments.length
  const inTransit = shipments.filter((s) => s.status === "in_transit").length
  const delivered = shipments.filter((s) => s.status === "delivered").length
  const processing = shipments.filter((s) => s.status === "preparing").length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={24} className="text-green-600" />
      case "in_transit":
        return <Truck size={24} className="text-blue-600" />
      case "preparing":
        return <Clock size={24} className="text-orange-600" />
      default:
        return <Clock size={24} className="text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#10b981"
      case "in_transit":
        return "#3b82f6"
      case "preparing":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

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

          {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold" style={{ color: "#005461" }}>
                  {isLoading ? "..." : totalShipments}
                </div>
                <p className="text-xs text-gray-600 mt-1">Total Shipments</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{isLoading ? "..." : inTransit}</div>
                <p className="text-xs text-gray-600 mt-1">In Transit</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{isLoading ? "..." : delivered}</div>
                <p className="text-xs text-gray-600 mt-1">Delivered</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading shipments...</div>
              ) : shipments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No shipments found</div>
              ) : (
                <div className="space-y-4">
                  {shipments.map((shipment) => (
                    <div
                      key={shipment.shipment_id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div>{getStatusIcon(shipment.status)}</div>
                        <div className="flex-1">
                          <p className="font-semibold">SHIP-{shipment.shipment_id.slice(0, 6)}</p>
                          <p className="text-sm text-gray-600">To: {shipment.users?.name || "Unknown Warehouse"}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Product: {shipment.products?.product_name || "Unknown"} | Qty: {shipment.quantity} units
                          </p>
                          {shipment.expected_delivery_date && (
                            <p className="text-xs text-gray-500">Expected: {new Date(shipment.expected_delivery_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            backgroundColor: getStatusColor(shipment.status),
                          }}
                        >
                          {formatStatus(shipment.status)}
                        </span>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
