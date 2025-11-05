// [AUTO-GEN-START] Mason Vector Entity Types
// Generated: 2025-11-05
// Strategy: Type-safe interfaces for all Supabase entities
// Source: supabase/migrations/20251105000000_safe_schema_complete.sql
// ============================================================================

// [AUTO-GEN-START] Claimant
export interface Claimant {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  address?: string;
  suburb?: string;
  state: string;
  postcode?: string;
  contact_number?: string;
  email?: string;
  abn?: string;
  acn?: string;
  amount?: number;
  entity_type?: string;
  source_state?: string;
  record_hash?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] Reminder
export interface Reminder {
  id: string;
  claimant_id?: string;
  due_date: string;
  description: string;
  completed?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] PendingClientInvite
export interface PendingClientInvite {
  id: string;
  email: string;
  token: string;
  role?: string;
  expires_at: string;
  created_by?: string;
  created_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] Activity
export interface Activity {
  id: string;
  actor_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  context?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] EmailTemplate
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] Payment
export interface Payment {
  id: string;
  claimant_id?: string;
  amount: number;
  currency?: string;
  status?: string;
  payment_method?: string;
  paid_at?: string;
  reference?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] Timesheet
export interface Timesheet {
  id: string;
  contractor_id?: string;
  claimant_id?: string;
  hours: number;
  rate?: number;
  total?: number;
  description?: string;
  work_date: string;
  approved?: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] Message
export interface Message {
  id: string;
  sender_id?: string;
  recipient_id?: string;
  subject?: string;
  content: string;
  read?: boolean;
  read_at?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] XeroSync
export interface XeroSync {
  id: string;
  entity_type: string;
  entity_id: string;
  xero_id?: string;
  last_sync_at?: string;
  sync_status?: string;
  error_message?: string;
  sync_data?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] SMSMessage
export interface SMSMessage {
  id: string;
  recipient_phone: string;
  message: string;
  status?: string;
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  cost?: number;
  provider?: string;
  provider_message_id?: string;
  claimant_id?: string;
  created_by?: string;
  created_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] SMSTemplate
export interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  variables?: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] ClientMessage
export interface ClientMessage {
  id: string;
  claimant_id: string;
  subject: string;
  message: string;
  read?: boolean;
  read_at?: string;
  reply_to?: string;
  created_by?: string;
  created_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] AppSettings
export interface AppSettings {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_by?: string;
  updated_at?: string;
  created_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] Task
export interface Task {
  id: string;
  claimant_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  completed_at?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] CompanyEssential
export interface CompanyEssential {
  id: string;
  abn: string;
  acn?: string;
  company_name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] TraceHistory
export interface TraceHistory {
  id: string;
  claimant_id?: string;
  trace_type: string;
  trace_data?: Record<string, any>;
  result?: string;
  status?: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] ClaimNote
export interface ClaimNote {
  id: string;
  claimant_id: string;
  note: string;
  note_type?: string;
  visibility?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] TraceConversation
export interface TraceConversation {
  id: string;
  claimant_id?: string;
  title?: string;
  status?: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] TraceMessage
export interface TraceMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  metadata?: Record<string, any>;
  created_at?: string;
}
// [AUTO-GEN-END]

// [AUTO-GEN-START] TraceToolRun
export interface TraceToolRun {
  id: string;
  conversation_id: string;
  message_id?: string;
  tool_name: string;
  tool_input?: Record<string, any>;
  tool_output?: Record<string, any>;
  status?: string;
  error?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
}
// [AUTO-GEN-END]

// ============================================================================
// Cross-Entity Relations (Joined Query Helpers)
// ============================================================================

// [AUTO-GEN-START] Relations
export interface ClaimantWithNotes extends Claimant {
  notes?: ClaimNote[];
}

export interface ClaimantWithReminders extends Claimant {
  reminders?: Reminder[];
}

export interface ClaimantWithPayments extends Claimant {
  payments?: Payment[];
}

export interface ClaimantWithTasks extends Claimant {
  tasks?: Task[];
}

export interface TraceConversationFull extends TraceConversation {
  messages?: TraceMessage[];
  tools?: TraceToolRun[];
}

export interface TaskWithClaimant extends Task {
  claimant?: Claimant;
}

export interface PaymentWithClaimant extends Payment {
  claimant?: Claimant;
}

export interface MessageWithSender extends Message {
  sender?: { id: string; name: string; email?: string };
  recipient?: { id: string; name: string; email?: string };
}
// [AUTO-GEN-END]

// ============================================================================
// Re-export Zod schemas
// ============================================================================
export * from "./zodSchemas";
// [AUTO-GEN-END]
