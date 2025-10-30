import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect root to the sample tenant dashboard
  redirect('/demo/dashboard')
}
