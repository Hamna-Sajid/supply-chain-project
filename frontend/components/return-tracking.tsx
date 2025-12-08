"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReturnRequest {
  id: string
  productName: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
  requestDate: string
}

const returnsData: ReturnRequest[] = [
  {
    id: "RET-001",
    productName: "Wireless Mouse",
    reason: "Defective after 3 days",
    status: "Pending",
    requestDate: "2024-01-16",
  },
  {
    id: "RET-002",
    productName: "USB-C Cable",
    reason: "Wrong color ordered",
    status: "Approved",
    requestDate: "2024-01-15",
  },
  {
    id: "RET-003",
    productName: "Phone Case",
    reason: "Does not fit phone model",
    status: "Pending",
    requestDate: "2024-01-14",
  },
  {
    id: "RET-004",
    productName: "Screen Protector",
    reason: "Damaged packaging",
    status: "Rejected",
    requestDate: "2024-01-13",
  },
  {
    id: "RET-005",
    productName: "Power Bank",
    reason: "Battery not holding charge",
    status: "Pending",
    requestDate: "2024-01-12",
  },
]

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
}

export function ReturnTracking() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Recent Return Requests</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {returnsData.map((returnItem) => (
            <div
              key={returnItem.id}
              className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{returnItem.id}</span>
                  <Badge className={statusColors[returnItem.status]}>{returnItem.status}</Badge>
                </div>
                <p className="text-sm text-gray-700 font-medium">{returnItem.productName}</p>
                <p className="text-xs text-gray-600 mt-1">{returnItem.reason}</p>
                <p className="text-xs text-gray-500 mt-1">Requested: {returnItem.requestDate}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
