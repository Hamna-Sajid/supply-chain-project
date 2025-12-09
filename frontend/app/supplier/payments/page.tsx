"use client"

import { SupplierSidebar } from "@/components/supplier-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { SupplierPaymentsPanel } from "@/components/supplier-payments-panel"

export default function SupplierPaymentsPage() {
  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Payment Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage payment status for orders you have delivered</p>
          </div>

          <SupplierPaymentsPanel />
        </div>
      </main>
    </div>
  )
}
