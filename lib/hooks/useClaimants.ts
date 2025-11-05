// useClaimants hook

import { useState, useEffect } from "react";
import type { Claimant } from "../claimantStore";

export function useClaimants() {
  const [claimants, setClaimants] = useState<Claimant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Mock load
    setLoading(false);
  }, []);

  const refreshClaimants = async () => {
    // Mock refresh
  };

  return { 
    data: claimants,
    isLoading: loading,
    error,
    claimants, 
    loading, 
    refreshClaimants 
  };
}

// Alias for legacy code - single claimant hook
export function useClaimant(id: string) {
  const [claimant, setClaimant] = useState<Claimant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock load single claimant
    setLoading(false);
  }, [id]);

  return { 
    data: claimant, 
    isLoading: loading,
    claimant, 
    loading 
  };
}

// Export mutations for legacy code
export function useClaimantMutations() {
  return {
    create: async (data: any) => ({ id: "mock", ...data }),
    update: async (id: string, data: any) => ({ id, ...data }),
    createClaimant: async (data: any) => ({ id: "mock", ...data }),
    updateClaimant: async (id: string, data: any) => ({ id, ...data }),
    deleteClaimant: async (id: string) => true,
  };
}

// Re-export optimistic helpers
export { optimisticAdd, optimisticUpdate, optimisticRemove } from "./optimistic";
