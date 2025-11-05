export const TESTING_MODE = process.env.NEXT_PUBLIC_TESTING_MODE === "true";

export function getTestingBanner() {
  if (!TESTING_MODE) return null;
  
  return {
    message: "🧪 Testing Mode Active - No real data will be modified",
    variant: "warning" as const,
  };
}

export function shouldAllowWrite(): boolean {
  return !TESTING_MODE;
}

// Mock data generators for testing mode
export const mockData = {
  claimants: [
    { id: "1", name: "John Smith", email: "john@example.com", phone: "0400 123 456", status: "active", created_at: "2024-01-15", updated_at: "2024-01-15" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "0400 234 567", status: "pending", created_at: "2024-01-16", updated_at: "2024-01-16" },
    { id: "3", name: "Michael Brown", email: "michael@example.com", phone: "0400 345 678", status: "active", created_at: "2024-01-17", updated_at: "2024-01-17" },
  ],
  
  metrics: {
    totalClaimants: 1234,
    openClaims: 456,
    totalValue: 2400000,
    successRate: 87,
  },
  
  tasks: [
    { id: "1", title: "Follow up with QLD Public Trustee", due: "2024-11-06", priority: "high", status: "pending" },
    { id: "2", title: "Review ASIC Gazette entries", due: "2024-11-07", priority: "medium", status: "in_progress" },
    { id: "3", title: "Update claimant documentation", due: "2024-11-08", priority: "low", status: "pending" },
  ],
  
  reminders: [
    { id: "1", title: "Client meeting - Smith case", date: "2024-11-06 10:00", type: "meeting" },
    { id: "2", title: "Deadline: NSW claim submission", date: "2024-11-07 17:00", type: "deadline" },
    { id: "3", title: "Follow-up call scheduled", date: "2024-11-08 14:00", type: "call" },
  ],
};
