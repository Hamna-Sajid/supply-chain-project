"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProductionItem {
  product_id: string
  product_name: string
  production_stage: string
  quantity?: number | null
}

const stageOptions = ["planning", "production", "quality_check", "completed"]

const stageColors: Record<string, string> = {
  "planning": "bg-gray-100 text-gray-800",
  "production": "bg-blue-100 text-blue-800",
  "quality_check": "bg-yellow-100 text-yellow-800",
  "completed": "bg-green-100 text-green-800",
}

const stageLabels: Record<string, string> = {
  "planning": "Planning",
  "production": "Production",
  "quality_check": "Quality Check",
  "completed": "Completed",
}

export function ProductionStatusTable() {
  const [productionData, setProductionData] = useState<ProductionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStages, setSelectedStages] = useState<Record<string, string>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
        const products = data.products || []
        setProductionData(products)
        
        // Initialize selected stages with current stages
        const stages: Record<string, string> = {}
        products.forEach((p: ProductionItem) => {
          stages[p.product_id] = p.production_stage
        })
        setSelectedStages(stages)
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

  const handleUpdateStage = async (productId: string) => {
    const newStage = selectedStages[productId]
    if (!newStage) return

    try {
      setUpdatingId(productId)
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturer/products/${productId}/stage`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          production_stage: newStage,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update stage: ${errorText}`)
      }

      // Update local state
      setProductionData(productionData.map(p => 
        p.product_id === productId 
          ? { ...p, production_stage: newStage, quantity: newStage === "completed" ? p.quantity : null }
          : p
      ))
      
      setError(null)
    } catch (err) {
      console.error("Error updating stage:", err)
      setError(err instanceof Error ? err.message : "Error updating stage")
    } finally {
      setUpdatingId(null)
    }
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Production Stage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {productionData.map((item) => (
                  <tr key={item.product_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.product_name}</td>
                    <td className="py-3 px-4">
                      <Badge className={stageColors[item.production_stage] || "bg-gray-100 text-gray-800"}>
                        {stageLabels[item.production_stage] || item.production_stage}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {item.production_stage === "completed" ? `${item.quantity || 0} units` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 items-center">
                        <select
                          value={selectedStages[item.product_id] || item.production_stage}
                          onChange={(e) => setSelectedStages({ ...selectedStages, [item.product_id]: e.target.value })}
                          className="text-sm border rounded px-2 py-1"
                        >
                          {stageOptions.map(stage => (
                            <option key={stage} value={stage}>
                              {stageLabels[stage]}
                            </option>
                          ))}
                        </select>
                        <Button 
                          size="sm" 
                          style={{ backgroundColor: "#018790", color: "white" }}
                          onClick={() => handleUpdateStage(item.product_id)}
                          disabled={updatingId === item.product_id}
                        >
                          {updatingId === item.product_id ? "Updating..." : "Update"}
                        </Button>
                      </div>
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
