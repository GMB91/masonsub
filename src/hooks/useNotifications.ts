// [AUTO-GEN-START] useNotifications Hook - Base-44 parity
// Generated: 2025-11-05
// Strategy: React Query hook for notification management

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

// Fetch notifications for a user
export function useNotifications(userId?: string, unreadOnly = false) {
  return useQuery({
    queryKey: ["notifications", userId, unreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (unreadOnly) params.append("unreadOnly", "true");

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch notifications");
      }

      return data.notifications as Notification[];
    },
    enabled: !!userId,
  });
}

// Create notification
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: {
      userId: string;
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "error";
    }) => {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to create notification");
      }

      return data.notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Mark notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to mark notification as read");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
// [AUTO-GEN-END]
