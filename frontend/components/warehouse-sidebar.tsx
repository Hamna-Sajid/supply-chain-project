"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, LogOut, LayoutDashboard, PackageOpen, BarChart3, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { label: "Incoming Shipments", id: "shipments", icon: PackageOpen },
  { label: "Inventory Management", id: "inventory", icon: BarChart3 },
  { label: "Order Fulfillment", id: "orders", icon: Truck },
]

export function WarehouseSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()

  // Get active tab from localStorage or sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("warehouseActiveTab")
    if (stored) {
      setActiveTab(stored)
    }
  }, [])

  const handleNavClick = (id: string) => {
    setActiveTab(id)
    sessionStorage.setItem("warehouseActiveTab", id)
    setIsOpen(false)
    // Trigger a custom event to notify WarehouseTabs component
    window.dispatchEvent(new CustomEvent("warehouseTabChange", { detail: { tab: id } }))
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    sessionStorage.removeItem("warehouseActiveTab")
    router.push("/")
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
          <p className="text-sm text-white/70">Warehouse Manager</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Button
            onClick={handleLogout}
            className="w-full text-white border-white/20 hover:bg-white/10 bg-transparent"
            variant="outline"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
