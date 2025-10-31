"use client"
import React from "react"
import { LayoutDashboard, FileText, DollarSign, PieChart, Users, Calendar, Settings } from 'lucide-react'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'cases', label: 'Active Cases', icon: FileText },
  { key: 'recovered', label: 'Recovered Funds', icon: DollarSign },
  { key: 'analytics', label: 'Analytics', icon: PieChart },
  { key: 'clients', label: 'Clients', icon: Users },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
]

export default function Sidebar({ active = 'dashboard' }: { active?: string }) {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-screen p-6 hidden md:flex md:flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#006D8F] flex items-center justify-center">
            {/* simple arrow SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1046 2 14 2.89543 14 4V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 4L14 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-serif"><span className="text-[#006D8F] font-bold">MASON</span> <span className="text-gray-900">VECTOR</span></div>
            <div className="text-xs text-gray-500">Lost Funds Reclaimed with Precision</div>
          </div>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2 text-sm">
          {NAV.map((n) => {
            const Icon = n.icon
            const isActive = active === n.key
            return (
              <li key={n.key} className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-200 ${isActive ? 'bg-[#006D8F] text-white shadow-md' : 'text-gray-800 hover:bg-gray-100'}`}>
                <span className={`p-2 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <Icon size={18} />
                </span>
                <span className="flex-1">{n.label}</span>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm">
          <Settings size={16} />
          Settings
        </button>
      </div>
    </aside>
  )
}
