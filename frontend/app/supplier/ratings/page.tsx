"use client"

import { SupplierSidebar } from "@/components/supplier-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Review {
  id: number
  customer: string
  rating: number
  comment: string
  date: string
}

const mockReviews: Review[] = [
  {
    id: 1,
    customer: "ABC Manufacturing",
    rating: 5,
    comment: "Excellent quality materials and fast delivery. Very satisfied!",
    date: "2025-01-15",
  },
  {
    id: 2,
    customer: "XYZ Industries",
    rating: 4,
    comment: "Good quality but delivery was slightly delayed.",
    date: "2025-01-14",
  },
  {
    id: 3,
    customer: "Tech Solutions",
    rating: 5,
    comment: "Outstanding service and competitive pricing. Highly recommended!",
    date: "2025-01-13",
  },
  {
    id: 4,
    customer: "Prime Corp",
    rating: 4,
    comment: "Good materials, could improve packaging.",
    date: "2025-01-12",
  },
  {
    id: 5,
    customer: "Global Suppliers",
    rating: 5,
    comment: "Perfect! Will definitely order again.",
    date: "2025-01-11",
  },
]

const starDistribution = [
  { stars: "5★", count: 3 },
  { stars: "4★", count: 2 },
  { stars: "3★", count: 0 },
  { stars: "2★", count: 0 },
  { stars: "1★", count: 0 },
]

const averageRating = (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1)

export default function RatingsReviewsPage() {
  return (
    <div className="flex">
      <SupplierSidebar />
      <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#005461" }}>
              Ratings & Reviews
            </h1>
            <p className="text-gray-600 mt-2">View customer feedback and performance metrics</p>
          </div>

          {/* Header Section - Average Rating and Star Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Average Rating Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Overall Performance</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="text-6xl font-bold" style={{ color: "#018790" }}>
                  {averageRating}
                </div>
                <div className="text-2xl text-yellow-500 mt-2">★</div>
                <p className="text-gray-600 mt-4">Based on {mockReviews.length} customer reviews</p>
              </CardContent>
            </Card>

            {/* Star Distribution Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={starDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stars" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#018790" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.customer}</p>
                        <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-3">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
