import TraceViewer from '@/components/admin/TraceViewer'

export const metadata = {
  title: 'Admin - Traces',
}

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Traces (Admin)</h1>
      <TraceViewer />
    </div>
  )
}
