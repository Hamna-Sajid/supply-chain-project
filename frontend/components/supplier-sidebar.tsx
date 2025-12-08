"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Home, Package, Truck, DollarSign, CreditCard, Star, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Dashboard", href: "/supplier/dashboard", icon: Home },
  { label: "Materials Catalog", href: "/supplier/materials", icon: Package },
  { label: "Manufacturer Orders", href: "/supplier/orders", icon: Truck },
  { label: "Payments", href: "/supplier/payments", icon: CreditCard },
  { label: "Financials", href: "/supplier/financials", icon: DollarSign },
  { label: "Ratings & Reviews", href: "/supplier/ratings", icon: Star },
  { label: "Notifications", href: "/supplier/notifications", icon: Bell },
]

export function SupplierSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-40 lg:z-auto transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#005461" }}
      >
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <h1 className="text-2xl font-bold text-white">SCM</h1>
          <p className="text-sm text-white/70">Supplier Portal</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-[#018790] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
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

      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
