"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Database, BarChart2, Globe, Shield, Code2, Cpu,
  FileText, Activity, Settings, Lock, Key, Bug, Server, Network, Terminal,
  ChevronDown, ChevronRight
} from "lucide-react";

export default function SystemSidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "🎯 Core", // Default expanded
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
      title: "🎯 Core",
      items: [
        { name: "Overview", icon: LayoutDashboard, href: "/system-administrator/core/overview" },
        { name: "Users", icon: Users, href: "/system-administrator/core/users" },
        { name: "Data", icon: Database, href: "/system-administrator/core/data" },
        { name: "Analytics", icon: BarChart2, href: "/system-administrator/core/analytics" },
      ],
    },
    {
      title: "🔧 Infrastructure",
      items: [
        { name: "Domains", icon: Globe, href: "/system-administrator/core/domains" },
        { name: "Server Health", icon: Server, href: "/system-administrator/core/health" },
        { name: "API", icon: Network, href: "/system-administrator/core/api" },
        { name: "Agents", icon: Cpu, href: "/system-administrator/core/agents" },
      ],
    },
    {
      title: "🔐 Security",
      items: [
        { name: "Security", icon: Shield, href: "/system-administrator/core/security" },
        { name: "Authentication", icon: Lock, href: "/system-administrator/core/settings/authentication" },
        { name: "Secrets", icon: Key, href: "/system-administrator/core/secrets" },
      ],
    },
    {
      title: "⚙️ System",
      items: [
        { name: "Settings", icon: Settings, href: "/system-administrator/core/settings/app-settings" },
        { name: "Code", icon: Code2, href: "/system-administrator/core/code" },
        { name: "Logs", icon: FileText, href: "/system-administrator/core/logs" },
        { name: "Debug & Audit", icon: Bug, href: "/system-administrator/core/debug" },
        { name: "Terminal", icon: Terminal, href: "/system-administrator/core/terminal" },
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
    </aside>
  );
}
