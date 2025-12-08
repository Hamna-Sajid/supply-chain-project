"use client"

import { useState } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: number
  type: "New Order" | "New Rating" | "Status Update"
  timestamp: string
  description: string
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "New Order",
    timestamp: "2 minutes ago",
    description: "New order O-1024 from Acme Manufacturing for 500 units of Aluminum Sheet",
    isRead: false,
  },
  {
    id: 2,
    type: "New Rating",
    timestamp: "1 hour ago",
    description: "ABC Manufacturing left a 5-star review: 'Excellent quality materials and fast delivery!'",
    isRead: false,
  },
  {
    id: 3,
    type: "Status Update",
    timestamp: "3 hours ago",
    description: "Order O-1023 has been shipped and is on its way to Tech Solutions",
    isRead: true,
  },
  {
    id: 4,
    type: "New Order",
    timestamp: "5 hours ago",
    description: "New order O-1022 from Prime Corp for 200 units of Steel Rod",
    isRead: true,
  },
  {
    id: 5,
    type: "Status Update",
    timestamp: "1 day ago",
    description: "Payment received for order O-1021 from XYZ Industries",
    isRead: true,
  },
  {
    id: 6,
    type: "New Rating",
    timestamp: "2 days ago",
    description: "Tech Solutions left a 4-star review: 'Good quality, could improve packaging'",
    isRead: true,
  },
]

export default function NotificationsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const filteredNotifications =
    selectedFilter === "All" ? notifications : notifications.filter((n) => n.type === selectedFilter)

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const typeColors = {
    "New Order": "bg-blue-100 text-blue-800",
    "New Rating": "bg-yellow-100 text-yellow-800",
    "Status Update": "bg-green-100 text-green-800",
  }

  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Notifications & Alerts
            </h1>
            <p className="text-gray-600 mt-2">Stay updated on your orders and activities</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["All", "New Order", "New Rating", "Status Update"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedFilter === filter ? "text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                style={selectedFilter === filter ? { backgroundColor: "#018790", color: "white" } : {}}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Notification Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                      !notification.isRead ? "border-l-[#018790] bg-blue-50" : "border-l-gray-200 bg-white"
                    } hover:shadow-sm`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={typeColors[notification.type]}>{notification.type}</Badge>
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-800">{notification.description}</p>
                      </div>
                      {!notification.isRead && (
                        <div
                          className="w-3 h-3 rounded-full mt-1 ml-4 flex-shrink-0"
                          style={{ backgroundColor: "#018790" }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No notifications found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
