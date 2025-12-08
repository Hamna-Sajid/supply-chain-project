"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RetailerOrder {
  id: string
  retailer: string
  itemCount: number
  totalValue: number
  orderDate: string
}

const retailerOrdersData: RetailerOrder[] = [
  { id: "RO-2024-001", retailer: "RetailHub Express", itemCount: 125, totalValue: 4500, orderDate: "2024-01-17" },
  { id: "RO-2024-002", retailer: "Quick Commerce Co", itemCount: 89, totalValue: 3200, orderDate: "2024-01-16" },
  { id: "RO-2024-003", retailer: "Premium Retail", itemCount: 156, totalValue: 5800, orderDate: "2024-01-16" },
]

export function WarehouseOrderFulfillment() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">New Retailer Orders</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {retailerOrdersData.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900">{order.id}</span>
                  <Badge className="bg-purple-100 text-purple-800">New Order</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Retailer</p>
                    <p className="font-medium text-gray-900">{order.retailer}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Items</p>
                    <p className="font-medium text-gray-900">{order.itemCount} units</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Value</p>
                    <p className="font-medium text-gray-900">${order.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <Button
                style={{ backgroundColor: "#018790", color: "white" }}
                onClick={() => console.log(`Process ${order.id}`)}
              >
                Start Processing
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
