import { redirect } from "next/navigation"

export default function Page() {
  // Redirect root to the admin dashboard
  redirect("/system-administrator/admin/main/dashboard")
}
