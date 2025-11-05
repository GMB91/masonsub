// Temporary import store

export interface ImportSession {
  id: string;
  filename: string;
  rows: any[];
  created_at: string;
}

const sessions: ImportSession[] = [];

export async function createImportSession(filename: string, rows: any[]): Promise<ImportSession> {
  const session: ImportSession = {
    id: crypto.randomUUID(),
    filename,
    rows,
    created_at: new Date().toISOString(),
  };
  sessions.push(session);
  return session;
}

export async function getImportSession(id: string): Promise<ImportSession | null> {
  return sessions.find((s) => s.id === id) || null;
}

export async function deleteImportSession(id: string): Promise<boolean> {
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return false;
  sessions.splice(index, 1);
  return true;
}

// Default export for legacy /src imports
export default {
  createImportSession,
  getImportSession,
  deleteImportSession,
  applyMapping: async (sessionId: string, mapping: Record<string, string>) => {
    // Mock apply mapping
    return { success: true };
  },
  readImportData: async (sessionId: string) => {
    const session = await getImportSession(sessionId);
    return session?.rows || [];
  },
  writeImportData: async (sessionId: string, data: any[], _meta?: any) => {
    // Mock write
    return { success: true };
  },
  cleanupOld: async (days: number = 7) => {
    // Mock cleanup
    return { deleted: 0 };
  },
};
