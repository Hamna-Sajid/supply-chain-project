"use client"

import { useEffect, useState } from "react"

interface User {
  user_id: string
  name: string
  role: string
  email: string
}

export function WarehouseHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

  // Get user initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="absolute top-6 right-6 flex items-center gap-3">
      {/* User Profile Circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "#018790" }}
      >
        <span className="text-white font-bold text-sm">{initials}</span>
      </div>

      {/* User Info */}
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-600 capitalize">{user.role.replace("_", " ")}</p>
      </div>
    </div>
  )
}
