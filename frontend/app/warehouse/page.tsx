import { redirect } from "next/navigation"

export const metadata = {
  title: "Warehouse Manager | SCM System",
}

export default function WarehouseRedirect() {
  redirect("/warehouse/dashboard")
}
