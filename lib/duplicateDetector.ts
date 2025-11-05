// Duplicate detection - uses dedupe.ts

import { findDuplicates, type ClaimantRecord } from "./dedupe";

export async function detectDuplicates(
  incoming: ClaimantRecord[],
  existing: ClaimantRecord[]
) {
  return findDuplicates(incoming, existing);
}

export async function findPotentialDuplicates(
  incoming: ClaimantRecord[],
  existing: ClaimantRecord[]
) {
  return findDuplicates(incoming, existing);
}

// Alias for legacy code
export function findDuplicate(
  incoming: ClaimantRecord[],
  existing: ClaimantRecord[]
) {
  return findDuplicates(incoming, existing);
}
