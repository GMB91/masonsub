// Trace store - mock implementation

export interface Trace {
  id: string;
  claimant_id: string;
  type: string;
  result: any;
  created_at: string;
}

const traces: Trace[] = [];

export async function getTracesByClaimantId(claimantId: string): Promise<Trace[]> {
  return traces.filter((t) => t.claimant_id === claimantId);
}

export async function createTrace(data: Omit<Trace, "id" | "created_at">): Promise<Trace> {
  const newTrace: Trace = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  traces.push(newTrace);
  return newTrace;
}

// Default export for backward compatibility
const traceStore = {
  getTracesByClaimantId,
  createTrace,
};

export default traceStore;
