"use client"

import { ManufacturerSidebar } from "@/components/manufacturer-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { ManufacturerPaymentsPanel } from "@/components/manufacturer-payments-panel"

export default function ManufacturerPaymentsPage() {
  return (
    <div className="flex">
      <ManufacturerSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Payment Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage payment status for your supplier orders</p>
          </div>

          <ManufacturerPaymentsPanel />
        </div>
      </main>
    </div>
  )
}
