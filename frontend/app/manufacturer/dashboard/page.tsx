import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { KPICards } from "@/components/kpi-cards"
import { ProductionStatusTable } from "@/components/production-status-table"
import { MaterialSourcingPanel } from "@/components/material-sourcing-panel"
import { ShipmentTracking } from "@/components/shipment-tracking"

export const metadata = {
  title: "Manufacturer Dashboard | SCM System",
  description: "Manage production, material sourcing, and shipments",
}

export default function ManufacturerDashboard() {
  return (
    <div className="flex">
      <ManufacturerSidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Manufacturer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage your production, materials, and shipments</p>
          </div>

          <KPICards />
          <ProductionStatusTable />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MaterialSourcingPanel />
            </div>
            <div>
              <ShipmentTracking />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
