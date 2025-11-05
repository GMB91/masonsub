// [AUTO-GEN-START] useMessages Hook - Base-44 parity
// Generated: 2025-11-05
// Strategy: React Query hook for internal messaging

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
}

// Fetch messages for a user
export function useMessages(userId?: string, conversationId?: string) {
  return useQuery({
    queryKey: ["messages", userId, conversationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (conversationId) params.append("conversationId", conversationId);

      const response = await fetch(`/api/messages?${params}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch messages");
      }

      return data.messages as Message[];
    },
    enabled: !!userId,
  });
}

// Send message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: {
      senderId: string;
      recipientId: string;
      subject: string;
      content: string;
    }) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      return data.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

// Mark message as read
export function useMarkMessageRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to mark message as read");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
// [AUTO-GEN-END]
