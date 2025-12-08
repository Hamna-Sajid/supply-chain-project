import { Sidebar } from "@/components/sidebar"
import { RetailerKPICards } from "@/components/retailer-kpi-cards"
import { SalesAnalyticsChart } from "@/components/sales-analytics-chart"
import { QuickSalePOS } from "@/components/quick-sale-pos"
import { ProductSourcingPanel } from "@/components/product-sourcing-panel"
import { ReturnTracking } from "@/components/return-tracking"

export const metadata = {
  title: "Retailer Dashboard | SCM System",
  description: "Manage sales, inventory, and returns",
}

export default function RetailerDashboard() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Retailer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage your sales, inventory, and returns</p>
          </div>

          {/* KPI Cards */}
          <RetailerKPICards />

          {/* Sales Analytics */}
          <SalesAnalyticsChart />

          {/* POS and Return Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <QuickSalePOS />
            </div>
            <div>
              <ReturnTracking />
            </div>
          </div>

          {/* Product Sourcing */}
          <ProductSourcingPanel />
        </div>
      </main>
    </div>
  )
}
