import { redirect } from "next/navigation"

export default function Page() {
  // Redirect root to the example org page created earlier
  redirect("/org/demo")
}
