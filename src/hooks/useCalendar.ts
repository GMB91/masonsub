// [AUTO-GEN-START] useCalendar Hook - Base-44 parity
// Generated: 2025-11-05
// Strategy: React Query hook for calendar event management

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "meeting" | "deadline" | "reminder" | "other";
  userId: string;
  created_at: string;
}

// Fetch calendar events for a specific month
export function useCalendarEvents(month: number, year: number, userId?: string) {
  return useQuery({
    queryKey: ["calendar-events", month, year, userId],
    queryFn: async () => {
      const params = new URLSearchParams({
        month: month.toString().padStart(2, "0"),
        year: year.toString(),
      });
      if (userId) params.append("userId", userId);

      const response = await fetch(`/api/calendar?${params}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to fetch calendar events");
      }

      return data.events as CalendarEvent[];
    },
  });
}

// Create calendar event
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      title: string;
      date: string;
      time?: string;
      type: "meeting" | "deadline" | "reminder" | "other";
      userId: string;
    }) => {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to create calendar event");
      }

      return data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

// Delete calendar event
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/calendar?eventId=${eventId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || "Failed to delete calendar event");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}
// [AUTO-GEN-END]
