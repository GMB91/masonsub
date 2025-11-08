"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Database, BarChart2, Globe, Shield, Code2, Cpu,
  FileText, Activity, Settings, Lock, Key, Bug, Server, Network, Terminal,
  ChevronDown, ChevronRight, Bot, TestTube, ShieldCheck, Clock, Calendar, CheckCircle,
  DollarSign, TrendingUp
} from "lucide-react";

export default function SystemSidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    // All sections collapsed by default
  ]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const systemNav = [
    {
      title: "� MAIN",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, href: "/system-administrator/admin/main/dashboard" },
        { name: "Claimants", icon: Users, href: "/system-administrator/admin/main/claimants" },
        { name: "Upload Data", icon: Database, href: "/system-administrator/admin/main/upload-data" },
        { name: "Calendar", icon: Calendar, href: "/system-administrator/admin/main/calendar" },
      ],
    },
    {
      title: "⚙️ OPERATIONS",
      items: [
        { name: "Workflows", icon: Activity, href: "/system-administrator/operations/workflows" },
        { name: "Templates", icon: FileText, href: "/system-administrator/operations/templates" },
        { name: "Reports", icon: BarChart2, href: "/system-administrator/operations/reports" },
      ],
    },
    {
      title: "💬 COMMUNICATION",
      items: [
        { name: "Templates", icon: FileText, href: "/system-administrator/communication/templates" },
        { name: "Messages", icon: Activity, href: "/system-administrator/communication/messages" },
        { name: "Campaigns", icon: Globe, href: "/system-administrator/communication/campaigns" },
      ],
    },
    {
      title: "💰 FINANCIAL",
      items: [
        { name: "Claims", icon: DollarSign, href: "/system-administrator/financial/claims" },
        { name: "Payments", icon: CheckCircle, href: "/system-administrator/financial/payments" },
        { name: "Analytics", icon: TrendingUp, href: "/system-administrator/financial/analytics" },
      ],
    },
    {
      title: "🔧 ADMINISTRATION",
      items: [
        { name: "Users", icon: Users, href: "/system-administrator/administration/users" },
        { name: "Permissions", icon: Lock, href: "/system-administrator/administration/permissions" },
        { name: "Settings", icon: Settings, href: "/system-administrator/administration/settings" },
      ],
    },
    {
      title: "🛠️ SYSTEM TOOLS",
      items: [
        { name: "Database", icon: Database, href: "/system-administrator/system-tools/database" },
        { name: "API Monitor", icon: Network, href: "/system-administrator/system-tools/api-monitor" },
        { name: "Logs", icon: Terminal, href: "/system-administrator/system-tools/logs" },
      ],
    },
    {
      title: "�🎯 CORE",
      items: [
        { name: "Overview", icon: LayoutDashboard, href: "/system-administrator/core/overview" },
        { name: "Users", icon: Users, href: "/system-administrator/core/users" },
        { name: "Data", icon: Database, href: "/system-administrator/core/data" },
        { name: "Analytics", icon: BarChart2, href: "/system-administrator/core/analytics" },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="font-semibold text-lg text-indigo-600">Mason Vector</h1>
        <p className="text-xs text-slate-500">System Control</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {systemNav.map((section) => {
          const isExpanded = expandedSections.includes(section.title);
          const hasActiveItem = section.items.some((item) => pathname === item.href);
          
          return (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase hover:bg-slate-50 rounded-md transition-colors"
              >
                <span>{section.title}</span>
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} href={item.href}>
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            active
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          <Icon size={16} />
                          {item.name}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Bottom System Admin Link */}
      <div className="border-t border-slate-200 p-3">
        <Link
          href="/system-admin"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            pathname.startsWith('/system-admin')
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          <ShieldCheck size={18} />
          <span>System Admin</span>
        </Link>
      </div>
    </aside>
  );
}
