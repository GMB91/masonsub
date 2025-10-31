import React from "react"
import StatGrid from '@/components/cards/StatGrid'
import StatCard from '@/components/cards/StatCard'
import { Users, FileText, Database, Activity } from 'lucide-react'

export default function DashboardPage() {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>

      <StatGrid>
        <StatCard title="Users" value={5} description="Total active users" icon={<Users size={18} />} />
        <StatCard title="Claims" value={12} delta="+8%" description="since last week" icon={<FileText size={18} />} />
        <StatCard title="Storage" value={'240 MB'} description="Used storage" icon={<Database size={18} />} />
        <StatCard title="Activity" value={'2h'} delta="-12%" description="last activity" icon={<Activity size={18} />} />
      </StatGrid>
    </section>
  )
}
