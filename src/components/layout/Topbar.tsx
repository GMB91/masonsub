"use client"
import React from "react"
import { Search, Bell, User } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* left area: optional breadcrumbs or title */}
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-gray-700">Dashboard</h1>
          </div>

          {/* center: search */}
          <div className="flex-1 px-6">
            <div className="max-w-lg mx-auto">
              <label htmlFor="topbar-search" className="sr-only">Search</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  id="topbar-search"
                  aria-label="Search"
                  placeholder="Search claimants, cases, clients..."
                  className="block w-full bg-gray-50 border border-transparent focus:border-[#006D8F] focus:ring-2 focus:ring-[#006D8F]/40 rounded-md py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* right area: notifications & profile */}
          <div className="flex items-center gap-4">
            <button aria-label="Notifications" className="relative p-2 rounded-md hover:bg-gray-100">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <button aria-label="Profile" className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">GV</div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-medium text-gray-800">Glenn Mason</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
