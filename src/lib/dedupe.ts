export interface ClaimantRecord {
  id?: string;
  full_name: string;
  address: string;
  amount: number;
  state: string;
  dob?: string;
  reference_id?: string;
  created_at?: string;
}

export interface DuplicateResult {
  duplicates: ClaimantRecord[];
  unique: ClaimantRecord[];
  duplicateCount: number;
}

export function findDuplicates(records: ClaimantRecord[]): DuplicateResult {
  const seen = new Map<string, ClaimantRecord>();
  const duplicates: ClaimantRecord[] = [];
  const unique: ClaimantRecord[] = [];

  for (const record of records) {
    // Create a key from name + address to identify duplicates
    const key = `${record.full_name.toLowerCase().trim()}-${record.address.toLowerCase().trim()}`;
    
    if (seen.has(key)) {
      duplicates.push(record);
    } else {
      seen.set(key, record);
      unique.push(record);
    }
  }

  return {
    duplicates,
    unique,
    duplicateCount: duplicates.length
  };
}

export function mergeDuplicates(duplicates: ClaimantRecord[]): ClaimantRecord {
  if (duplicates.length === 0) {
    throw new Error('Cannot merge empty duplicates array');
  }

  const base = duplicates[0];
  const totalAmount = duplicates.reduce((sum, record) => sum + record.amount, 0);

  return {
    ...base,
    amount: totalAmount,
    reference_id: duplicates.map(d => d.reference_id).filter(Boolean).join(', ')
  };
}