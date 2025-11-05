// [AUTO-GEN-START] useReports Hook - Base-44 parity
// Generated: 2025-11-05
// Strategy: React Query hook for report generation

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Report {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface GeneratedReport {
  id: string;
  reportId: string;
  status: "generating" | "completed" | "failed";
  format: "pdf" | "csv" | "xlsx";
  downloadUrl?: string;
  created_at: string;
}

// Fetch available report templates
export function useReportTemplates(type?: string) {
  return useQuery({
    queryKey: ["report-templates", type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append("type", type);

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch report templates");
      }

      return data.reports as Report[];
    },
  });
}

// Generate report
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: {
      reportId: string;
      filters?: Record<string, any>;
      format?: "pdf" | "csv" | "xlsx";
    }) => {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      return data.report as GeneratedReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-reports"] });
    },
  });
}
// [AUTO-GEN-END]
