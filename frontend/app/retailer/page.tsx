"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RetailerRoot() {
  const router = useRouter()

  useEffect(() => {
    router.push("/retailer/dashboard")
  }, [router])

  return null
}
