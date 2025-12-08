"use client"

import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

const inventory = [
  {
    id: 1,
    product: "Component A",
    sku: "COMP-001",
    quantity: 150,
    minLevel: 200,
    location: "Warehouse A",
    status: "Low",
  },
  {
    id: 2,
    product: "Component B",
    sku: "COMP-002",
    quantity: 750,
    minLevel: 500,
    location: "Warehouse B",
    status: "Normal",
  },
  {
    id: 3,
    product: "Assembly Unit",
    sku: "ASS-001",
    quantity: 89,
    minLevel: 100,
    location: "Warehouse A",
    status: "Critical",
  },
  {
    id: 4,
    product: "Final Product",
    sku: "FIN-001",
    quantity: 450,
    minLevel: 300,
    location: "Warehouse C",
    status: "Normal",
  },
]

export default function FinishedGoodsInventory() {
  return (
    <div className="flex">
      <ManufacturerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Finished Goods Inventory
            </h1>
            <p className="text-gray-600 mt-2">Monitor stock levels and warehouse locations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold" style={{ color: "#005461" }}>
                  1,439
                </div>
                <p className="text-xs text-gray-600 mt-1">Total Units</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">2</div>
                <p className="text-xs text-gray-600 mt-1">Healthy Stock</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">1</div>
                <p className="text-xs text-gray-600 mt-1">Low Stock</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">1</div>
                <p className="text-xs text-gray-600 mt-1">Critical Stock</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Stock Levels by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "#E5E7EB" }}>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        SKU
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Current Qty
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Min. Level
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-semibold" style={{ color: "#005461" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-100 transition-colors">
                        <td className="py-3 px-4 font-medium">{item.product}</td>
                        <td className="py-3 px-4">{item.sku}</td>
                        <td className="py-3 px-4">{item.quantity} units</td>
                        <td className="py-3 px-4">{item.minLevel} units</td>
                        <td className="py-3 px-4">{item.location}</td>
                        <td className="py-3 px-4">
                          {item.status === "Critical" && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle size={16} />
                              <span className="font-medium">{item.status}</span>
                            </div>
                          )}
                          {item.status === "Low" && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-orange-500">
                              {item.status}
                            </span>
                          )}
                          {item.status === "Normal" && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-green-500">
                              {item.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
