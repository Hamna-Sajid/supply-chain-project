"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReturnRequest {
  id: string
  product_name: string
  reason: string
  status: string
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
}

export function ReturnTracking() {
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retailer/returns`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", errorText)
          return
        }

        const data = await response.json()
        setReturns(data.returns || [])
      } catch (error) {
        console.error("Error fetching returns:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReturns()
  }, [])

  const getStatusColor = (status: string) => {
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Recent Return Requests</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading returns...</div>
        ) : returns.length > 0 ? (
          <div className="space-y-3">
            {returns.map((returnItem) => (
              <div
                key={returnItem.id}
                className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{returnItem.id}</span>
                    <Badge className={getStatusColor(returnItem.status)}>
                      {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{returnItem.product_name}</p>
                  <p className="text-xs text-gray-600 mt-1">{returnItem.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requested: {new Date(returnItem.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No return requests</div>
        )}
      </CardContent>
    </Card>
  )
}
