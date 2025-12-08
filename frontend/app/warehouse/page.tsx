import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WarehouseLowStockAlerts } from "@/components/warehouse-low-stock-alerts"
import { WarehouseIncomingShipments } from "@/components/warehouse-incoming-shipments"
import { WarehouseOrderFulfillment } from "@/components/warehouse-order-fulfillment"

export const metadata = {
  title: "Warehouse Manager Dashboard | SCM System",
  description: "Manage shipment reception, inventory, and order fulfillment",
}

export default function WarehouseManagerDashboard() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Warehouse Manager Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage shipment reception, inventory, and order fulfillment</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Incoming Shipments (Today)</CardTitle>
                  <span className="text-2xl">📦</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                  4
                </div>
                <p className="text-xs text-gray-500 mt-1">Expected deliveries</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Stock Value</CardTitle>
                  <span className="text-2xl">💰</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                  $2.4M
                </div>
                <p className="text-xs text-gray-500 mt-1">Across all SKUs</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Orders Ready for Shipment</CardTitle>
                  <span className="text-2xl">🚚</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#005461" }}>
                  12
                </div>
                <p className="text-xs text-gray-500 mt-1">Queued for dispatch</p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alerts - Prominent */}
          <div className="mb-8">
            <WarehouseLowStockAlerts />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <WarehouseIncomingShipments />
            </div>
            <div>
              <WarehouseOrderFulfillment />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
