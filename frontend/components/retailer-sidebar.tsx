"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, LayoutDashboard, ShoppingCart, Receipt, Box, RefreshCw, BarChart3, LogOut } from "lucide-react"

export function RetailerSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { name: "Dashboard", path: "/retailer/dashboard", icon: LayoutDashboard },
    { name: "Product Catalog", path: "/retailer/product-catalog", icon: ShoppingCart },
    { name: "Sales Register", path: "/retailer/sales-register", icon: Receipt },
    { name: "Retail Inventory", path: "/retailer/inventory", icon: Box },
    { name: "Returns Management", path: "/retailer/returns", icon: RefreshCw },
    { name: "Financials & Analytics", path: "/retailer/analytics", icon: BarChart3 },
  ]

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#005461] text-white shadow-lg flex flex-col z-40">
        <div className="p-6 border-b border-[#003d47]">
          <h2 className="text-xl font-bold text-white">Retailer Portal</h2>
          <p className="text-sm text-gray-300 mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    isActive ? "bg-[#018790] text-white" : "text-gray-200 hover:bg-[#004050]"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#003d47] p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#018790] hover:bg-[#016678] text-white font-medium transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 lg:hidden z-50 bg-[#005461] text-white p-2 rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#005461] text-white shadow-lg flex flex-col z-40 mt-16">
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                      isActive ? "bg-[#018790] text-white" : "text-gray-200 hover:bg-[#004050]"
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-[#003d47] p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-[#018790] hover:bg-[#016678] text-white font-medium transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}
    </>
  )
}
