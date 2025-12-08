"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigationByRole = {
  manufacturer: [
    { label: "Dashboard", href: "/manufacturer", icon: "🏠" },
    { label: "Material Sourcing", href: "/manufacturer/material-sourcing", icon: "📦" },
    { label: "Product Management", href: "/manufacturer/product-management", icon: "🏭" },
    { label: "Finished Goods Inventory", href: "/manufacturer/inventory", icon: "📊" },
    { label: "Warehouse Shipments", href: "/manufacturer/shipments", icon: "🚚" },
    { label: "Financials & Analytics", href: "/manufacturer/analytics", icon: "📈" },
  ],
  supplier: [
    { label: "Dashboard", href: "/supplier", icon: "🏠" },
    { label: "Manage Materials", href: "/supplier/manage-materials", icon: "📦" },
    { label: "View Orders", href: "/supplier/view-orders", icon: "📋" },
    { label: "Order Management", href: "/supplier/order-management", icon: "✅" },
    { label: "Inventory Overview", href: "/supplier/inventory-overview", icon: "📊" },
    { label: "Analytics", href: "/supplier/analytics", icon: "📈" },
  ],
  warehouse: [
    { label: "Dashboard", href: "/warehouse", icon: "🏠" },
    { label: "Shipments", href: "/warehouse/shipments", icon: "📦" },
    { label: "Inventory", href: "/warehouse/inventory", icon: "📊" },
    { label: "Low Stock Alerts", href: "/warehouse/low-stock-alerts", icon: "⚠️" },
    { label: "Orders", href: "/warehouse/orders", icon: "📋" },
  ],
  retailer: [
    { label: "Dashboard", href: "/retailer", icon: "🏠" },
    { label: "POS System", href: "/retailer/pos", icon: "💳" },
    { label: "Inventory", href: "/retailer/inventory", icon: "📊" },
    { label: "Orders", href: "/retailer/orders", icon: "🛒" },
    { label: "Returns", href: "/retailer/returns", icon: "↩️" },
    { label: "Analytics", href: "/retailer/analytics", icon: "📈" },
  ],
}

const roleLabels = {
  manufacturer: "Manufacturer",
  supplier: "Supplier",
  warehouse: "Warehouse Manager",
  retailer: "Retailer",
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<string>("")
  const [navItems, setNavItems] = useState<typeof navigationByRole.manufacturer>([])

  useEffect(() => {
    const userString = localStorage.getItem("user")
    if (userString) {
      try {
        const user = JSON.parse(userString)
        const userRole = user.role?.toLowerCase() || ""
        setRole(userRole)
        
        // Get navigation items for this role, default to manufacturer if not found
        const items = navigationByRole[userRole as keyof typeof navigationByRole] || navigationByRole.manufacturer
        setNavItems(items)
      } catch (error) {
        console.error("Error parsing user:", error)
        setNavItems(navigationByRole.manufacturer)
      }
    }
  }, [])

  const getRoleLabel = () => {
    return roleLabels[role as keyof typeof roleLabels] || "User"
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-40 lg:z-auto transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#005461" }}
      >
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <h1 className="text-2xl font-bold text-white">SCM</h1>
          <p className="text-sm text-white/70">{getRoleLabel()}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Button
            onClick={handleLogout}
            className="w-full text-white border-white/20 hover:bg-white/10 bg-transparent border flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
