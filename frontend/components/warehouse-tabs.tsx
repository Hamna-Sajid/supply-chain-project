"use client"

import { useState, useEffect } from "react"
import { LayoutDashboard, PackageOpen, BarChart3, Truck } from "lucide-react"
import { WarehouseDashboard } from "./warehouse-dashboard"
import { WarehouseIncomingShipments } from "./warehouse-incoming-shipments"
import { WarehouseLowStockAlerts } from "./warehouse-low-stock-alerts"
import { WarehouseOrderFulfillment } from "./warehouse-order-fulfillment"

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "shipments", label: "Incoming Shipments", icon: PackageOpen },
  { id: "inventory", label: "Inventory Management", icon: BarChart3 },
  { id: "orders", label: "Order Fulfillment", icon: Truck },
]

export function WarehouseTabs() {
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    // Get stored tab from sessionStorage
    const stored = sessionStorage.getItem("warehouseActiveTab")
    if (stored) {
      setActiveTab(stored)
    }

    // Listen for custom events from sidebar
    const handleTabChange = (event: Event) => {
      const customEvent = event as CustomEvent
      setActiveTab(customEvent.detail.tab)
    }

    window.addEventListener("warehouseTabChange", handleTabChange)
    return () => window.removeEventListener("warehouseTabChange", handleTabChange)
  }, [])

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    sessionStorage.setItem("warehouseActiveTab", tabId)
  }

  return (
    <div>
      {/* Tab Content */}
      <div>
        {activeTab === "dashboard" && (
          <div>
            <WarehouseDashboard />
            <div className="mt-8 mb-8">
              <WarehouseLowStockAlerts />
            </div>
          </div>
        )}

        {activeTab === "shipments" && (
          <div>
            <WarehouseIncomingShipments />
          </div>
        )}

        {activeTab === "inventory" && (
          <div>
            <WarehouseLowStockAlerts />
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <WarehouseOrderFulfillment />
          </div>
        )}
      </div>
    </div>
  )
}
