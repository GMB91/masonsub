// [AUTO-GEN-START] useAuditLog Hook - Base-44 parity
// Generated: 2025-11-05
// Strategy: React Query hook for audit log management

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  context?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// Fetch audit log entries
export function useAuditLog(filters?: {
  userId?: string;
  action?: string;
  entityType?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["audit-log", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.action) params.append("action", filters.action);
      if (filters?.entityType) params.append("entityType", filters.entityType);
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/audit?${params}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch audit log");
      }

      return data.auditLogs as AuditLogEntry[];
    },
  });
}

// Create audit log entry
export function useCreateAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      actorId: string;
      action: string;
      entityType: string;
      entityId: string;
      context?: Record<string, any>;
    }) => {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to create audit log");
      }

      return data.auditLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}
// [AUTO-GEN-END]
