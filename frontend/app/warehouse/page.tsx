import { WarehouseSidebar } from "@/components/warehouse-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { WarehouseTabs } from "@/components/warehouse-tabs"

export const metadata = {
  title: "Warehouse Manager Dashboard | SCM System",
  description: "Manage shipment reception, inventory, and order fulfillment",
}

export default function WarehouseManagerDashboard() {
  return (
    <div className="flex">
      <WarehouseSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          {/* Header with User Profile */}
          <WarehouseHeader />

          {/* Page Title */}
          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Warehouse Manager Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage shipment reception, inventory, and order fulfillment</p>
          </div>

          {/* Tabs */}
          <WarehouseTabs />
        </div>
      </main>
    </div>
  )
}
