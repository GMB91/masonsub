import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const stats = [
    { label: "Users", value: 5 },
    { label: "Claims", value: 12 },
    { label: "Storage (MB)", value: 240 },
    { label: "Last Activity", value: "2h ago" },
  ]
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">MasonSub Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader><CardTitle>{s.label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-semibold">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-4">
        <Button>Members</Button>
        <Button>Billing</Button>
        <Button>Security</Button>
      </div>
    </main>
  )
}
