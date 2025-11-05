"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, LayoutDashboard, Users, Upload, Calendar, ClipboardList, Clock,
  Timer, MessageSquare, Mail, Smartphone, Wallet, FileText, BarChart2, Cog,
  UserCog, Building2, Wrench, Shield, BookOpen, Bot, Rocket, FlaskConical,
  Search, Download, Settings, ChevronDown, ChevronRight
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "🏠 Main", // Default expanded
  ]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const nav = [
    {
      title: "🏠 Main",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, href: "/system-administrator/admin/main/dashboard" },
        { name: "Claimants", icon: Users, href: "/system-administrator/admin/main/claimants" },
        { name: "Upload Data", icon: Upload, href: "/system-administrator/admin/main/upload-data" },
        { name: "Calendar", icon: Calendar, href: "/system-administrator/admin/main/calendar" },
      ],
    },
    {
      title: "⚙️ Operations",
      items: [
        { name: "My Tasks", icon: ClipboardList, href: "/system-administrator/admin/operations/my-tasks" },
        { name: "Weekly Tasks", icon: Clock, href: "/system-administrator/admin/operations/weekly-tasks" },
        { name: "Timesheets", icon: Timer, href: "/system-administrator/admin/operations/timesheets" },
        { name: "Messages", icon: MessageSquare, href: "/system-administrator/admin/operations/messages" },
      ],
    },
    {
      title: "💬 Communication",
      items: [
        { name: "Email Templates", icon: Mail, href: "/system-administrator/admin/communication/email-templates" },
        { name: "SMS (Coming Soon)", icon: Smartphone, href: "#" },
      ],
    },
    {
      title: "💰 Financial",
      items: [
        { name: "Financial Tracking", icon: Wallet, href: "/system-administrator/admin/financial/financial-tracking" },
        { name: "Xero Settings", icon: FileText, href: "/system-administrator/admin/financial/xero-settings" },
        { name: "Reports", icon: BarChart2, href: "/system-administrator/admin/financial/reports" },
      ],
    },
    {
      title: "🔧 Administration",
      items: [
        { name: "User Management", icon: UserCog, href: "/system-administrator/admin/administration/user-management" },
        { name: "Client Management", icon: Building2, href: "/system-administrator/admin/administration/client-management" },
        { name: "Contractor Management", icon: Wrench, href: "/system-administrator/admin/administration/contractor-management" },
        { name: "Security & MFA", icon: Shield, href: "/system-administrator/admin/administration/security-mfa" },
        { name: "Company Essentials", icon: BookOpen, href: "/system-administrator/admin/administration/company-essentials" },
        { name: "Automated Workflows", icon: Bot, href: "/system-administrator/admin/administration/automated-workflows" },
        { name: "Audit Logging", icon: FileText, href: "/system-administrator/admin/administration/audit-logging" },
        { name: "Settings", icon: Cog, href: "/system-administrator/admin/administration/settings" },
      ],
    },
    {
      title: "🛠️ System Tools",
      items: [
        { name: "Pre-Launch Check", icon: Rocket, href: "/system-administrator/admin/system-tools/pre-launch-check" },
        { name: "System Testing", icon: FlaskConical, href: "/system-administrator/admin/system-tools/system-testing" },
        { name: "Tracer Agent", icon: Search, href: "/system-administrator/admin/system-tools/tracer-agent" },
        { name: "API Import", icon: Download, href: "/system-administrator/admin/system-tools/api-import" },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="font-semibold text-lg text-indigo-600">Mason Vector</h1>
        <p className="text-xs text-slate-500">Admin Console</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {nav.map((section) => {
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
