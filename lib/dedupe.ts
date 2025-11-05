/**
 * Deduplication utility for claimant data
 * Matches based on normalized full_name + dob + state
 */

export interface ClaimantRecord {
  full_name?: string;
  dob?: string;
  state?: string;
  [key: string]: any;
}

export interface DedupeResult {
  duplicates: ClaimantRecord[];
  fresh: ClaimantRecord[];
}

/**
 * Generate a unique key for deduplication
 */
function generateKey(record: ClaimantRecord): string {
  const name = (record.full_name || "").toLowerCase().trim();
  const dob = (record.dob || "").trim();
  const state = (record.state || "").toUpperCase().trim();
  return `${name}|${dob}|${state}`;
}

/**
 * Find duplicates between incoming and existing records
 */
export function findDuplicates(
  incoming: ClaimantRecord[],
  existing: ClaimantRecord[]
): DedupeResult {
  // Build a set of existing record keys
  const existingKeys = new Set(existing.map(generateKey));

  const duplicates: ClaimantRecord[] = [];
  const fresh: ClaimantRecord[] = [];

  // Classify each incoming record
  for (const record of incoming) {
    const key = generateKey(record);
    
    if (existingKeys.has(key)) {
      duplicates.push(record);
    } else {
      fresh.push(record);
      // Add to set to catch duplicates within the incoming batch
      existingKeys.add(key);
    }
  }

  return { duplicates, fresh };
}

/**
 * Find duplicates within a single array
 */
export function findInternalDuplicates(
  records: ClaimantRecord[]
): DedupeResult {
  const seen = new Set<string>();
  const duplicates: ClaimantRecord[] = [];
  const fresh: ClaimantRecord[] = [];

  for (const record of records) {
    const key = generateKey(record);
    
    if (seen.has(key)) {
      duplicates.push(record);
    } else {
      fresh.push(record);
      seen.add(key);
    }
  }

  return { duplicates, fresh };
}

/**
 * Normalize address for matching (simple version)
 */
export function normalizeAddress(address?: string): string {
  if (!address) return "";
  
  return address
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

/**
 * Generate address hash for advanced matching
 */
export function generateAddressHash(address?: string): string {
  if (!address) return "";
  
  const normalized = normalizeAddress(address);
  
  // Simple hash function (in production, use a proper hash like SHA256)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
}
