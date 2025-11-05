// Claimant store - mock implementation
// In production, this would interface with Supabase

export interface Claimant {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;
  state: string;
  amount?: number;
  source?: string;
  status: "new" | "in_progress" | "completed" | "rejected";
  created_at?: string;
  updated_at?: string;
}

// Mock data store
const claimants: Claimant[] = [];

export async function getAllClaimants(): Promise<Claimant[]> {
  // In production: return await supabase.from('claimants').select('*');
  return claimants;
}

export async function getClaimants(org?: string): Promise<Claimant[]> {
  // In production: filter by org
  // return await supabase.from('claimants').select('*').eq('org', org);
  return claimants;
}

export async function getClaimantById(id: string): Promise<Claimant | null> {
  // In production: return await supabase.from('claimants').select('*').eq('id', id).single();
  return claimants.find((c) => c.id === id) || null;
}

export async function createClaimant(data: Omit<Claimant, "id" | "created_at" | "updated_at">): Promise<Claimant> {
  // In production: return await supabase.from('claimants').insert(data).select().single();
  const newClaimant: Claimant = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  claimants.push(newClaimant);
  return newClaimant;
}

export async function updateClaimant(id: string, data: Partial<Claimant>): Promise<Claimant | null> {
  // In production: return await supabase.from('claimants').update(data).eq('id', id).select().single();
  const index = claimants.findIndex((c) => c.id === id);
  if (index === -1) return null;
  claimants[index] = { ...claimants[index], ...data, updated_at: new Date().toISOString() };
  return claimants[index];
}

export async function deleteClaimant(id: string): Promise<boolean> {
  // In production: return await supabase.from('claimants').delete().eq('id', id);
  const index = claimants.findIndex((c) => c.id === id);
  if (index === -1) return false;
  claimants.splice(index, 1);
  return true;
}

// Default export for backward compatibility
const claimantStore = {
  getAllClaimants,
  getClaimants,
  getClaimantById,
  createClaimant,
  updateClaimant,
  deleteClaimant,
};

export default claimantStore;
