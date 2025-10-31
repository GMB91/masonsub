export type Claimant = {
  id: string
  // older/alternate schemas used across the codebase
  name?: string
  org?: string
  createdAt?: string

  // more granular fields
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  city?: string
  amount?: number
  status?: string

  // allow extra fields (claimId, claimAmount, source, etc.)
  [key: string]: unknown
}
