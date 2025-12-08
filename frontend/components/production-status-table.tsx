"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProductionItem {
  id: string
  name: string
  stage: "Planning" | "In Progress" | "Quality Check" | "Ready to Ship"
}

const productionData: ProductionItem[] = [
  { id: "PROD-001", name: "Electronic Assembly Unit", stage: "In Progress" },
  { id: "PROD-002", name: "Metal Frame Component", stage: "Quality Check" },
  { id: "PROD-003", name: "Plastic Housing", stage: "Planning" },
  { id: "PROD-004", name: "Circuit Board Assembly", stage: "Ready to Ship" },
  { id: "PROD-005", name: "Cable Harness", stage: "In Progress" },
]

const stageColors = {
  Planning: "bg-gray-100 text-gray-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Quality Check": "bg-yellow-100 text-yellow-800",
  "Ready to Ship": "bg-green-100 text-green-800",
}

export function ProductionStatusTable() {
  return (
    <Card className="border-0 shadow-sm mb-8">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Production Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Product ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Production Stage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {productionData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.id}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">
                    <Badge className={stageColors[item.stage]}>{item.stage}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" style={{ backgroundColor: "#018790", color: "white" }}>
                      Update Stage
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
