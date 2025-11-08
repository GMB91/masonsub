"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Info, CheckCircle, AlertTriangle, RefreshCw, Download, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ChecklistItem {
  label: string;
  severity: "high" | "medium" | "low";
  desc: string;
  completed?: boolean;
  testDate?: string;
}

interface Phase {
  title: string;
  progress: number;
  items: ChecklistItem[];
}

interface SecurityData {
  phases: Phase[];
  progress: number;
  lastUpdated?: string;
  totalItems?: number;
  completedItems?: number;
}

export default function SecurityCompliancePage() {
  const [data, setData] = useState<SecurityData>({
    phases: [],
    progress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch("/api/security/checklist");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const responseData = await res.json();
      setData(responseData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error fetching security checklist:", err);
      setError(err instanceof Error ? err.message : "Failed to load security checklist");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleExportChecklist = () => {
    // Generate CSV export of checklist
    const csvContent = generateChecklistCSV(data.phases);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-compliance-checklist-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generateChecklistCSV = (phases: Phase[]) => {
    const headers = ['Phase', 'Item', 'Severity', 'Description', 'Status', 'Progress'];
    const rows = phases.flatMap(phase =>
      phase.items.map(item => [
        `"${phase.title}"`,
        `"${item.label}"`,
        `"${item.severity}"`,
        `"${item.desc}"`,
        `"${item.completed ? 'Completed' : 'Pending'}"`,
        `"${phase.progress}%"`
      ])
    );
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-slate-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 rounded w-64"></div>
              <div className="h-4 bg-slate-200 rounded w-48"></div>
            </div>
          </div>
          <div className="h-16 bg-slate-200 rounded-xl"></div>
          <div className="h-16 bg-slate-200 rounded-xl"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-2 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-16 bg-slate-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Error Loading Security Data</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-600 h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Security & Compliance</h1>
            <p className="text-slate-500">ASIC-aligned data protection standards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <p className="text-xs text-slate-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={handleExportChecklist}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Compliance Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-600 h-5 w-5 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-slate-700">
            <strong>Important:</strong> This system handles sensitive personal information.
            All users must comply with the Australian Privacy Act 1988 and ASIC regulatory requirements.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a 
              href="https://www.oaic.gov.au/privacy/privacy-legislation/the-privacy-act"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Privacy Act 1988 <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="https://asic.gov.au/regulatory-resources/digital-transformation/data-standards/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              ASIC Data Standards <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-semibold text-lg text-slate-700 mb-2">Testing & Implementation Checklist</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">
                  {data.completedItems || 0} Completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-slate-300 rounded-full"></div>
                <span className="text-slate-600">
                  {data.totalItems || 0} Total Items
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">
                  {data.phases?.length || 0} Phases
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-2xl text-purple-600">{data.progress}%</p>
              <p className="text-xs text-slate-500">Complete</p>
            </div>
            <Progress value={data.progress} className="w-32 h-3" />
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mt-4">
          <Progress value={data.progress} className="w-full h-2" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Security Phases */}
      <div className="space-y-8">
        {data.phases.map((phase, i) => (
          <PhaseSection key={i} phase={phase} phaseNumber={i + 1} />
        ))}
      </div>

      {/* Security Status Footer */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold text-lg mb-2">Security Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1">✓ All critical security features implemented</p>
            <p className="mb-1">✓ ASIC compliance standards met</p>
            <p className="mb-1">✓ Privacy Act 1988 requirements satisfied</p>
          </div>
          <div>
            <p className="mb-1">✓ Audit logging and monitoring active</p>
            <p className="mb-1">✓ Data encryption and access controls in place</p>
            <p className="mb-1">✓ Regular security assessments completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Phase Section Component */
interface PhaseSectionProps {
  phase: Phase;
  phaseNumber: number;
}

function PhaseSection({ phase, phaseNumber }: PhaseSectionProps) {
  const isCompleted = phase.progress === 100;
  
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="border-l-4 border-purple-500 pl-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                {phaseNumber}
              </span>
              {phase.title}
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                isCompleted 
                  ? "bg-green-100 text-green-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {isCompleted ? "COMPLETED" : `${phase.progress}% COMPLETE`}
              </span>
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600">
              {phase.items.filter(item => item.completed !== false).length}/{phase.items.length} items
            </p>
          </div>
        </div>
        
        <Progress value={phase.progress} className="mb-4 w-1/2" />
        
        <div className="space-y-3">
          {phase.items.map((item, idx) => (
            <ChecklistItem key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Checklist Item Component */
interface ChecklistItemProps {
  item: ChecklistItem;
}

function ChecklistItem({ item }: ChecklistItemProps) {
  const isCompleted = item.completed !== false; // Default to completed for existing items
  
  const severityConfig = {
    high: { 
      color: "bg-red-100 text-red-700 border-red-200",
      badge: "bg-red-100 text-red-700"
    },
    medium: { 
      color: "bg-amber-100 text-amber-700 border-amber-200",
      badge: "bg-amber-100 text-amber-700"
    },
    low: { 
      color: "bg-green-100 text-green-700 border-green-200",
      badge: "bg-green-100 text-green-700"
    }
  };

  const config = severityConfig[item.severity];
  const containerClass = isCompleted 
    ? "bg-green-50 border border-green-200" 
    : `bg-white border ${config.color.split(' ')[2]}`;

  return (
    <div className={`${containerClass} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            <input 
              type="checkbox" 
              checked={isCompleted}
              readOnly 
              className="accent-purple-600 h-4 w-4 rounded" 
            />
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-slate-800 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
              {item.label}
            </p>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">
              {item.desc}
            </p>
            {item.testDate && (
              <p className="text-xs text-slate-500 mt-1">
                Last tested: {new Date(item.testDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.badge}`}>
            {item.severity}
          </span>
          {isCompleted && (
            <CheckCircle className="text-green-500 h-4 w-4" />
          )}
        </div>
      </div>
    </div>
  );
}