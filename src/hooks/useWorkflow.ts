// [AUTO-GEN-START] useWorkflow Hook - Base-44 parity
// Generated: 2025-11-05
// Strategy: React Query hook for workflow queue management

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface WorkflowJob {
  id: string;
  jobType: string;
  status: "pending" | "processing" | "completed" | "failed";
  priority: "low" | "medium" | "high";
  created_at: string;
}

export interface WorkflowQueue {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  items: WorkflowJob[];
}

// Fetch workflow queue status
export function useWorkflowQueue(status?: "pending" | "processing" | "completed" | "failed") {
  return useQuery({
    queryKey: ["workflow-queue", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const response = await fetch(`/api/workflow?${params}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch workflow queue");
      }

      return data.queue as WorkflowQueue;
    },
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });
}

// Add job to workflow queue
export function useAddWorkflowJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: {
      jobType: string;
      payload: any;
      priority?: "low" | "medium" | "high";
    }) => {
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to add workflow job");
      }

      return data.job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-queue"] });
    },
  });
}

// Update workflow job status
export function useUpdateWorkflowJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: {
      jobId: string;
      status: "pending" | "processing" | "completed" | "failed";
      result?: any;
    }) => {
      const response = await fetch("/api/workflow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to update workflow job");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-queue"] });
    },
  });
}
// [AUTO-GEN-END]
