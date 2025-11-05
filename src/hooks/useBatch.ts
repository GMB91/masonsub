// [AUTO-GEN-START] useBatch Hook - Base-44 parity
// Generated: 2025-11-05
// Strategy: React Query hook for batch processing

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface BatchJob {
  id: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  total: number;
  processed: number;
  failed: number;
  created_at: string;
  completed_at?: string;
}

// Fetch batch jobs
export function useBatchJobs(status?: string) {
  return useQuery({
    queryKey: ["batch-jobs", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const response = await fetch(`/api/batch?${params}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch batch jobs");
      }

      return data.jobs as BatchJob[];
    },
    refetchInterval: 3000, // Poll every 3 seconds for active jobs
  });
}

// Create batch job
export function useCreateBatchJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: {
      type: string;
      items: any[];
      options?: Record<string, any>;
    }) => {
      const response = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to create batch job");
      }

      return data.job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-jobs"] });
    },
  });
}

// Cancel batch job
export function useCancelBatchJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/batch?jobId=${jobId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to cancel batch job");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-jobs"] });
    },
  });
}
// [AUTO-GEN-END]
