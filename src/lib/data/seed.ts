import type { Claimant } from '@/types/claimant'

export const sampleClaimants: Claimant[] = [
  { id: 'c-1', firstName: 'John', lastName: 'Smith', email: 'john@example.com', city: 'Brisbane', amount: 5000, status: 'Researching' },
  { id: 'c-2', firstName: 'Sarah', lastName: 'Jones', email: 'sarah@example.com', city: 'Sydney', amount: 12000, status: 'In Progress' },
]

export default { sampleClaimants }
