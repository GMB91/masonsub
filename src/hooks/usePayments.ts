// [AUTO-GEN-START] usePayments Hook - Base-44 parity
// Generated: 2025-11-05
// Strategy: React Query hook for payment management

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Payment {
  id: string;
  claimantId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  paymentMethod: string;
  reference: string;
  created_at: string;
}

// Fetch payments
export function usePayments(filters?: {
  claimantId?: string;
  status?: "pending" | "completed" | "failed";
}) {
  return useQuery({
    queryKey: ["payments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.claimantId) params.append("claimantId", filters.claimantId);
      if (filters?.status) params.append("status", filters.status);

      const response = await fetch(`/api/payments?${params}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch payments");
      }

      return data.payments as Payment[];
    },
  });
}

// Process payment
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: {
      claimantId: string;
      amount: number;
      currency?: string;
      paymentMethod: string;
    }) => {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      return data.payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

// Update payment status
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: {
      paymentId: string;
      status: "pending" | "completed" | "failed";
    }) => {
      const response = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to update payment status");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
// [AUTO-GEN-END]
