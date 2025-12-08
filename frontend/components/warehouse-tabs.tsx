"use client"

import { useState, useEffect } from "react"
import { WarehouseDashboard } from "./warehouse-dashboard"
import { WarehouseIncomingShipments } from "./warehouse-incoming-shipments"
import { WarehouseLowStockAlerts } from "./warehouse-low-stock-alerts"
import { WarehouseOrderFulfillment } from "./warehouse-order-fulfillment"

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "shipments", label: "Incoming Shipments", icon: "📦" },
  { id: "inventory", label: "Inventory Management", icon: "📊" },
  { id: "orders", label: "Order Fulfillment", icon: "🚚" },
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
      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-3 flex items-center gap-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 text-white"
                  : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
              }`}
              style={{
                borderBottomColor: activeTab === tab.id ? "#018790" : "transparent",
                color: activeTab === tab.id ? "#018790" : undefined,
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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
