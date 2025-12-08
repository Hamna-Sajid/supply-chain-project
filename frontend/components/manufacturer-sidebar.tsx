"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, LayoutDashboard, ShoppingBag, Factory, Package, Truck, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Dashboard", href: "/manufacturer/dashboard", icon: LayoutDashboard },
  { label: "Material Sourcing", href: "/manufacturer/material-sourcing", icon: ShoppingBag },
  { label: "Product Management", href: "/manufacturer/product-management", icon: Factory },
  { label: "Finished Goods Inventory", href: "/manufacturer/inventory", icon: Package },
  { label: "Warehouse Shipments", href: "/manufacturer/shipments", icon: Truck },
  { label: "Financials & Analytics", href: "/manufacturer/analytics", icon: BarChart3 },
]

export function ManufacturerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
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
          <p className="text-sm text-white/70">Manufacturer</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white transition-colors"
                style={{
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(1, 135, 144, 0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Button
            onClick={handleLogout}
            className="w-full text-white border-white/20 hover:bg-white/10 bg-transparent border flex items-center gap-2"
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
