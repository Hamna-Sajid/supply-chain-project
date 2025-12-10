import { Sidebar } from "@/components/sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { ReturnTracking } from "@/components/return-tracking"

export const metadata = {
  title: "Returns | Retailer Dashboard",
  description: "Manage product returns",
}

export default function ReturnsPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Return Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage product returns</p>
          </div>

          <ReturnTracking />
        </div>
      </main>
    </div>
  )
}
