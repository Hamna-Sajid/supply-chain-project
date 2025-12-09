"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface IncomingShipment {
  id: string
  manufacturer: string
  expectedDate: string
  currentStatus: string
}

const statusColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-800",
  "In Transit": "bg-blue-100 text-blue-800",
  "Arriving Soon": "bg-green-100 text-green-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
}

export function WarehouseIncomingShipments() {
  const [shipments, setShipments] = useState<IncomingShipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouse/shipments`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()
        setShipments(data || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching shipments:", err)
        setError("Failed to load shipments")
      } finally {
        setLoading(false)
      }
    }

    fetchShipments()
  }, [])

  const handleAccept = async (shipmentId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouse/shipments/${shipmentId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setShipments(shipments.filter(s => s.id !== shipmentId))
        setSuccess("Shipment accepted successfully!")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Failed to accept shipment")
      }
    } catch (err) {
      setError("Error accepting shipment")
    }
  }

  const handleReject = async (shipmentId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouse/shipments/${shipmentId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setShipments(shipments.filter(s => s.id !== shipmentId))
        setSuccess("Shipment rejected successfully!")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError("Failed to reject shipment")
      }
    } catch (err) {
      setError("Error rejecting shipment")
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Pending Deliveries</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {error && <div className="m-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="m-4 p-4 bg-green-50 text-green-700 rounded-lg">{success}</div>}
        {loading && <div className="text-center py-6 text-gray-500">Loading shipments...</div>}
        {!loading && shipments.length === 0 && <div className="text-center py-6 text-gray-500">No pending shipments</div>}
        {!loading && shipments.length > 0 && (
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
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{shipment.id}</td>
                    <td className="py-3 px-4 text-gray-700">{shipment.manufacturer}</td>
                    <td className="py-3 px-4 text-gray-700">{new Date(shipment.expectedDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[shipment.currentStatus] || "bg-gray-100 text-gray-800"}>
                        {shipment.currentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button
                        size="sm"
                        style={{ backgroundColor: "#018790", color: "white" }}
                        onClick={() => handleAccept(shipment.id)}
                      >
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(shipment.id)}>
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
