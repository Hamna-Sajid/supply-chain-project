"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProductionItem {
  product_id: string
  product_name: string
  sku: string
  production_stage: string
  quantity: number
}

const stageColors: Record<string, string> = {
  "Design": "bg-gray-100 text-gray-800",
  "Manufacturing": "bg-blue-100 text-blue-800",
  "Quality Check": "bg-yellow-100 text-yellow-800",
  "Packaging": "bg-purple-100 text-purple-800",
  "Ready": "bg-green-100 text-green-800",
}

export function ProductionStatusTable() {
  const [productionData, setProductionData] = useState<ProductionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        
        if (!token) {
          throw new Error("No authentication token found. Please log in.")
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/products`, {
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
        setProductionData(data.products || [])
        setError(null)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Error loading products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const getStageColor = (stage: string): string => {
    // Normalize stage name to match keys
    const normalizedStage = stage
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
    return stageColors[normalizedStage] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="border-0 shadow-sm mb-8">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg">Production Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading production data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : productionData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No products in production</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Product Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Production Stage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {productionData.map((item) => (
                  <tr key={item.product_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.product_name}</td>
                    <td className="py-3 px-4">{item.sku}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStageColor(item.production_stage)}>{item.production_stage}</Badge>
                    </td>
                    <td className="py-3 px-4">{item.quantity} units</td>
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
        )}
      </CardContent>
    </Card>
  )
}
