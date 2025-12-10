"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Payment {
  payment_id: string | null
  payment_date: string | null
  payment_status: string
  payment_amount: number
}

interface PaymentData {
  order_id: string
  manufacturer: string
  order_date: string
  order_status: string
  order_total: number
  payment: Payment
}

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
}

const capitalizeStatus = (status: string | null | undefined) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

// Define payment status hierarchy (index represents progression)
const PAYMENT_STATUS_HIERARCHY: Record<string, number> = {
  pending: 0,
  paid: 1,
}

// Get allowed next statuses based on current status
const getAllowedNextPaymentStatuses = (currentStatus: string): string[] => {
  const currentLevel = PAYMENT_STATUS_HIERARCHY[currentStatus.toLowerCase()] ?? 0
  return Object.entries(PAYMENT_STATUS_HIERARCHY)
    .filter(([_, level]) => level >= currentLevel)
    .map(([status]) => status)
}

export function SupplierPaymentsPanel() {
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please log in again")
        return
      }

      const response = await fetch(`${API_URL}/supplier/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      } else {
        const errorData = await response.text()
        console.error("Error response:", response.status, errorData)
        setError(`Failed to load payments: ${response.status}`)
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }



  const handleUpdateStatus = async () => {
    if (!selectedPayment || !newStatus) {
      alert("Invalid payment or status")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const paymentId = selectedPayment.payment.payment_id || "null"
      const response = await fetch(
        `${API_URL}/supplier/payments/${paymentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_status: newStatus,
            order_id: selectedPayment.order_id
          }),
        }
      )

      if (response.ok) {
        const updatedPayment = await response.json()
        setPayments(
          payments.map((p) =>
            p.order_id === selectedPayment.order_id
              ? {
                ...p,
                payment: {
                  payment_id: updatedPayment.payment_id,
                  payment_date: updatedPayment.payment_date,
                  payment_status: updatedPayment.status || updatedPayment.payment_status,
                  payment_amount: updatedPayment.amount || updatedPayment.payment_amount
                }
              }
              : p
          )
        )
        setSelectedPayment({
          ...selectedPayment,
          payment: {
            payment_id: updatedPayment.payment_id,
            payment_date: updatedPayment.payment_date,
            payment_status: updatedPayment.status || updatedPayment.payment_status,
            payment_amount: updatedPayment.amount || updatedPayment.payment_amount
          },
        })
        setShowStatusModal(false)
        setNewStatus("")
      } else {
        alert("Failed to update payment status")
      }
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Error updating payment status")
    }
  }

  const getPaymentStats = () => {
    return {
      total: payments.length,
      pending: payments.filter(p => p.payment.payment_status === 'pending').length,
      paid: payments.filter(p => p.payment.payment_status === 'paid').length,
    }
  }

  const stats = getPaymentStats()

  return (
    <div className="space-y-6">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: "#005461" }}>
                {stats.total}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total Payments</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
              <p className="text-xs text-gray-600 mt-1">Paid</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading payments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No payments yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Manufacturer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Payment Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.order_id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedPayment(p)}
                      >
                        <td className="py-3 px-4 font-medium text-blue-600">{p.order_id}</td>
                        <td className="py-3 px-4">{p.manufacturer}</td>
                        <td className="py-3 px-4 font-semibold">${(p.order_total || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className={paymentStatusColors[p.payment.payment_status] || "bg-gray-100 text-gray-800"}>
                            {capitalizeStatus(p.payment.payment_status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {p.payment.payment_date ? new Date(p.payment.payment_date).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            style={{ backgroundColor: "#018790", color: "white" }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPayment(p)
                              setNewStatus(p.payment.payment_status)
                              setShowStatusModal(true)
                            }}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Panel */}
        <Card className="border-0 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPayment ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600">ORDER ID</p>
                  <p className="text-lg font-bold" style={{ color: "#005461" }}>
                    {selectedPayment.order_id}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600">MANUFACTURER</p>
                  <p className="font-medium">{selectedPayment.manufacturer}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600">PAYMENT AMOUNT</p>
                  <p className="text-xl font-bold text-green-600">${(selectedPayment.payment.payment_amount || 0).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600">PAYMENT STATUS</p>
                  <Badge className={paymentStatusColors[selectedPayment.payment.payment_status] || "bg-gray-100 text-gray-800"}>
                    {capitalizeStatus(selectedPayment.payment.payment_status)}
                  </Badge>
                </div>

                {selectedPayment.payment.payment_date && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600">PAYMENT DATE</p>
                    <p className="text-sm">{new Date(selectedPayment.payment.payment_date).toLocaleDateString()}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-600">ORDER DATE</p>
                  <p className="text-sm">{new Date(selectedPayment.order_date).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600">ORDER STATUS</p>
                  <Badge className="bg-gray-100 text-gray-800">
                    {capitalizeStatus(selectedPayment.order_status)}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Select a payment to view details</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Payment Status Modal */}
      {showStatusModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Update Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Order ID</label>
                <p className="mt-1 text-gray-900 font-semibold">{selectedPayment.order_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Current Status</label>
                <p className="mt-1 text-gray-900">{capitalizeStatus(selectedPayment.payment.payment_status)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm"
                >
                  <option value="">Select new status</option>
                  {getAllowedNextPaymentStatuses(selectedPayment.payment.payment_status).map((status) => (
                    <option key={status} value={status}>
                      {capitalizeStatus(status)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Note: You can only mark as paid, not revert to pending</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowStatusModal(false)
                    setNewStatus("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 text-white"
                  style={{ backgroundColor: "#018790" }}
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || newStatus === selectedPayment.payment.payment_status}
                >
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
