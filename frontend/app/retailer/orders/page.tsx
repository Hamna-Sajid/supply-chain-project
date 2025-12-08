import { Sidebar } from "@/components/sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { ProductSourcingPanel } from "@/components/product-sourcing-panel"

export const metadata = {
  title: "Orders | Retailer Dashboard",
  description: "Manage orders from suppliers",
}

export default function OrdersPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">Place and manage orders from suppliers</p>
          </div>

          <ProductSourcingPanel />
        </div>
      </main>
    </div>
  )
}
