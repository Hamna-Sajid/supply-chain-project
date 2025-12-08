"use client"

import { useState, useEffect } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { WarehouseHeader } from "@/components/warehouse-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Notification {
  id: number
  type: string
  timestamp: string
  description: string
  isRead: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        const response = await fetch(`${API_URL}/supplier/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        } else {
          setError("Failed to load notifications")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "New Order": "bg-blue-100 text-blue-800",
      "New Rating": "bg-yellow-100 text-yellow-800",
      "Status Update": "bg-green-100 text-green-800",
      default: "bg-gray-100 text-gray-800",
    }
    return colors[type] || colors.default
  }

  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8 relative">
          <WarehouseHeader />

          <div className="mb-8 pr-48">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Notifications
            </h1>
            <p className="text-gray-600 mt-2">Stay updated with the latest alerts and messages</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">All Notifications</CardTitle>
                  <Badge className="bg-gray-100 text-gray-800">{notifications.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border rounded-lg ${
                          notif.isRead ? "bg-gray-50 border-gray-200" : "bg-white border-blue-200"
                        } hover:shadow-sm transition-shadow`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTypeColor(notif.type)}>{notif.type}</Badge>
                              {!notif.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>}
                            </div>
                            <p className="text-gray-900 text-sm mb-1">{notif.description}</p>
                            <p className="text-xs text-gray-500">{notif.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
