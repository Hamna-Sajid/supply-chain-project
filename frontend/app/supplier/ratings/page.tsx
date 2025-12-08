"use client"

import { useState, useEffect } from "react"
import { SupplierSidebar } from "@/components/supplier-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface Review {
  id: number
  given_by: string
  rating_value: number
  comment: string
  created_at: string
}

export default function RatingsReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [starDistribution, setStarDistribution] = useState<Array<{ stars: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Please log in again")
          return
        }

        const response = await fetch(`${API_URL}/supplier/ratings`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setReviews(data.ratings || [])

          if (data.ratings && data.ratings.length > 0) {
            const avgRating = data.average_rating || (data.ratings.reduce((sum: number, r: Review) => sum + r.rating_value, 0) / data.ratings.length)
            setAverageRating(Number(avgRating).toFixed(1))

            // Calculate star distribution
            const distribution = [
              { stars: "5★", count: data.ratings.filter((r: Review) => r.rating_value === 5).length },
              { stars: "4★", count: data.ratings.filter((r: Review) => r.rating_value === 4).length },
              { stars: "3★", count: data.ratings.filter((r: Review) => r.rating_value === 3).length },
              { stars: "2★", count: data.ratings.filter((r: Review) => r.rating_value === 2).length },
              { stars: "1★", count: data.ratings.filter((r: Review) => r.rating_value === 1).length },
            ]
            setStarDistribution(distribution)
          }
        } else {
          setError("Failed to load ratings")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ratings")
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [])
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

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading ratings...</p>
            </div>
          ) : (
            <>
              {/* Header Section - Average Rating and Star Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Average Rating Card */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="text-6xl font-bold" style={{ color: "#018790" }}>
                      {averageRating || "N/A"}
                    </div>
                    <div className="text-2xl text-yellow-500 mt-2">★</div>
                    <p className="text-gray-600 mt-4">Based on {reviews.length} customer reviews</p>
                  </CardContent>
                </Card>

                {/* Star Distribution Chart */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Rating Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {starDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={starDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="stars" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#018790" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-gray-500">No rating data</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Reviews List */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{review.given_by}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${i < review.rating_value ? "text-yellow-500" : "text-gray-300"}`}
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">No reviews yet</div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
