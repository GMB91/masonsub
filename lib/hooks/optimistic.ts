// Optimistic update hook

import { useState } from "react";

export function useOptimistic<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  return [value, setValue] as const;
}

// Helper functions for legacy code - simple wrappers that ignore the setState callback
export function optimisticAdd<T extends { id?: string }>(items: T[], newItem: T, _setFn?: any): T[] {
  return [...items, { ...newItem, id: newItem.id || Math.random().toString(36) }];
}

export function optimisticUpdate<T extends { id: string }>(items: T[], id: string, updates: Partial<T>, _setFn?: any): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

export function optimisticRemove<T extends { id: string }>(items: T[], id: string, _setFn?: any): T[] {
  return items.filter((item) => item.id !== id);
}
