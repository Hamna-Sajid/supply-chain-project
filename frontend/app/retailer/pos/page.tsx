import { Sidebar } from "@/components/sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { QuickSalePOS } from "@/components/quick-sale-pos"

export const metadata = {
  title: "POS System | Retailer Dashboard",
  description: "Point of Sale System",
}

export default function POSPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Point of Sale System
            </h1>
            <p className="text-gray-600 mt-2">Record sales transactions</p>
          </div>

          <QuickSalePOS />
        </div>
      </main>
    </div>
  )
}
