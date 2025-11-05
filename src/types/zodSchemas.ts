// [AUTO-GEN-START] Mason Vector Zod Validation Schemas
// Generated: 2025-11-05
// Strategy: Runtime validation schemas for all entities
// Usage: ClaimantSchema.parse(data) for type-safe validation
// ============================================================================

import { z } from "zod";

// [AUTO-GEN-START] Claimant Schema
export const ClaimantSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1, "Full name is required"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  suburb: z.string().optional(),
  state: z.string().min(1, "State is required"),
  postcode: z.string().optional(),
  contact_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  abn: z.string().optional(),
  acn: z.string().optional(),
  amount: z.number().optional(),
  entity_type: z.string().optional(),
  source_state: z.string().optional(),
  record_hash: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Claimant = z.infer<typeof ClaimantSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] Reminder Schema
export const ReminderSchema = z.object({
  id: z.string().uuid(),
  claimant_id: z.string().uuid().optional(),
  due_date: z.string(),
  description: z.string().min(1, "Description is required"),
  completed: z.boolean().optional().default(false),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Reminder = z.infer<typeof ReminderSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] PendingClientInvite Schema
export const PendingClientInviteSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Valid email required"),
  token: z.string().min(1),
  role: z.string().optional().default("client"),
  expires_at: z.string(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
});
export type PendingClientInvite = z.infer<typeof PendingClientInviteSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] Activity Schema
export const ActivitySchema = z.object({
  id: z.string().uuid(),
  actor_id: z.string().uuid().optional(),
  action: z.string().min(1, "Action is required"),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  context: z.record(z.any()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.string().optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] EmailTemplate Schema
export const EmailTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  variables: z.record(z.any()).optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] Payment Schema
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  claimant_id: z.string().uuid().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().optional().default("AUD"),
  status: z.enum(["pending", "completed", "failed"]).optional().default("pending"),
  payment_method: z.string().optional(),
  paid_at: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Payment = z.infer<typeof PaymentSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] Timesheet Schema
export const TimesheetSchema = z.object({
  id: z.string().uuid(),
  contractor_id: z.string().uuid().optional(),
  claimant_id: z.string().uuid().optional(),
  hours: z.number().positive("Hours must be positive"),
  rate: z.number().positive().optional(),
  total: z.number().optional(),
  description: z.string().optional(),
  work_date: z.string(),
  approved: z.boolean().optional().default(false),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Timesheet = z.infer<typeof TimesheetSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] Message Schema
export const MessageSchema = z.object({
  id: z.string().uuid(),
  sender_id: z.string().uuid().optional(),
  recipient_id: z.string().uuid().optional(),
  subject: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  read: z.boolean().optional().default(false),
  read_at: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Message = z.infer<typeof MessageSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] XeroSync Schema
export const XeroSyncSchema = z.object({
  id: z.string().uuid(),
  entity_type: z.string().min(1, "Entity type is required"),
  entity_id: z.string().uuid(),
  xero_id: z.string().optional(),
  last_sync_at: z.string().optional(),
  sync_status: z.enum(["pending", "syncing", "completed", "failed"]).optional(),
  error_message: z.string().optional(),
  sync_data: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type XeroSync = z.infer<typeof XeroSyncSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] SMSMessage Schema
export const SMSMessageSchema = z.object({
  id: z.string().uuid(),
  recipient_phone: z.string().min(1, "Phone number is required"),
  message: z.string().min(1, "Message is required").max(160, "SMS max 160 characters"),
  status: z.enum(["queued", "sent", "delivered", "failed"]).optional(),
  sent_at: z.string().optional(),
  delivered_at: z.string().optional(),
  error_message: z.string().optional(),
  cost: z.number().optional(),
  provider: z.string().optional(),
  provider_message_id: z.string().optional(),
  claimant_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
});
export type SMSMessage = z.infer<typeof SMSMessageSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] SMSTemplate Schema
export const SMSTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Template name is required"),
  message: z.string().min(1, "Message is required").max(160, "SMS max 160 characters"),
  variables: z.record(z.any()).optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type SMSTemplate = z.infer<typeof SMSTemplateSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] ClientMessage Schema
export const ClientMessageSchema = z.object({
  id: z.string().uuid(),
  claimant_id: z.string().uuid(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  read: z.boolean().optional().default(false),
  read_at: z.string().optional(),
  reply_to: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
});
export type ClientMessage = z.infer<typeof ClientMessageSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] AppSettings Schema
export const AppSettingsSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1, "Settings key is required"),
  value: z.any(),
  description: z.string().optional(),
  updated_by: z.string().uuid().optional(),
  updated_at: z.string().optional(),
  created_at: z.string().optional(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] Task Schema
export const TaskSchema = z.object({
  id: z.string().uuid(),
  claimant_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional().default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  due_date: z.string().optional(),
  completed_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Task = z.infer<typeof TaskSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] CompanyEssential Schema
export const CompanyEssentialSchema = z.object({
  id: z.string().uuid(),
  abn: z.string().min(1, "ABN is required"),
  acn: z.string().optional(),
  company_name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type CompanyEssential = z.infer<typeof CompanyEssentialSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] TraceHistory Schema
export const TraceHistorySchema = z.object({
  id: z.string().uuid(),
  claimant_id: z.string().uuid().optional(),
  trace_type: z.string().min(1, "Trace type is required"),
  trace_data: z.record(z.any()).optional(),
  result: z.string().optional(),
  status: z.enum(["pending", "running", "completed", "failed"]).optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
});
export type TraceHistory = z.infer<typeof TraceHistorySchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] ClaimNote Schema
export const ClaimNoteSchema = z.object({
  id: z.string().uuid(),
  claimant_id: z.string().uuid(),
  note: z.string().min(1, "Note is required"),
  note_type: z.enum(["general", "call", "meeting", "email", "system"]).optional(),
  visibility: z.enum(["private", "internal", "client"]).optional().default("internal"),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type ClaimNote = z.infer<typeof ClaimNoteSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] TraceConversation Schema
export const TraceConversationSchema = z.object({
  id: z.string().uuid(),
  claimant_id: z.string().uuid().optional(),
  title: z.string().optional(),
  status: z.enum(["active", "completed", "archived"]).optional().default("active"),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type TraceConversation = z.infer<typeof TraceConversationSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] TraceMessage Schema
export const TraceMessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().min(1, "Content is required"),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().optional(),
});
export type TraceMessage = z.infer<typeof TraceMessageSchema>;
// [AUTO-GEN-END]

// [AUTO-GEN-START] TraceToolRun Schema
export const TraceToolRunSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  message_id: z.string().uuid().optional(),
  tool_name: z.string().min(1, "Tool name is required"),
  tool_input: z.record(z.any()).optional(),
  tool_output: z.record(z.any()).optional(),
  status: z.enum(["pending", "running", "completed", "failed"]).optional(),
  error: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  created_at: z.string().optional(),
});
export type TraceToolRun = z.infer<typeof TraceToolRunSchema>;
// [AUTO-GEN-END]

// ============================================================================
// Partial Schemas (for updates)
// ============================================================================

// [AUTO-GEN-START] Partial Schemas
export const ClaimantUpdateSchema = ClaimantSchema.partial().omit({ id: true });
export const ReminderUpdateSchema = ReminderSchema.partial().omit({ id: true });
export const PaymentUpdateSchema = PaymentSchema.partial().omit({ id: true });
export const TaskUpdateSchema = TaskSchema.partial().omit({ id: true });
export const ClaimNoteUpdateSchema = ClaimNoteSchema.partial().omit({ id: true });
// [AUTO-GEN-END]

// ============================================================================
// Schema Aggregates
// ============================================================================

export const AllSchemas = {
  ClaimantSchema,
  ReminderSchema,
  PendingClientInviteSchema,
  ActivitySchema,
  EmailTemplateSchema,
  PaymentSchema,
  TimesheetSchema,
  MessageSchema,
  XeroSyncSchema,
  SMSMessageSchema,
  SMSTemplateSchema,
  ClientMessageSchema,
  AppSettingsSchema,
  TaskSchema,
  CompanyEssentialSchema,
  TraceHistorySchema,
  ClaimNoteSchema,
  TraceConversationSchema,
  TraceMessageSchema,
  TraceToolRunSchema,
};

// Export all types for external use
export type {
  Claimant,
  Reminder,
  PendingClientInvite,
  Activity,
  EmailTemplate,
  Payment,
  Timesheet,
  Message,
  XeroSync,
  SMSMessage,
  SMSTemplate,
  ClientMessage,
  AppSettings,
  Task,
  CompanyEssential,
  TraceHistory,
  ClaimNote,
  TraceConversation,
  TraceMessage,
  TraceToolRun,
};

// ============================================================================
// Schema-to-Table Mapping (Supabase Integration)
// ============================================================================

// [AUTO-GEN-START] Schema bindings
import type { Database } from "@/types/database.types";

export const SchemaMap: Record<keyof Database["public"]["Tables"], any> = {
  claimants: ClaimantSchema,
  reminders: ReminderSchema,
  pending_client_invites: PendingClientInviteSchema,
  activities: ActivitySchema,
  email_templates: EmailTemplateSchema,
  payments: PaymentSchema,
  timesheets: TimesheetSchema,
  messages: MessageSchema,
  xero_sync: XeroSyncSchema,
  sms_messages: SMSMessageSchema,
  sms_templates: SMSTemplateSchema,
  client_messages: ClientMessageSchema,
  app_settings: AppSettingsSchema,
  tasks: TaskSchema,
  company_essentials: CompanyEssentialSchema,
  trace_history: TraceHistorySchema,
  claim_notes: ClaimNoteSchema,
  trace_conversations: TraceConversationSchema,
  trace_messages: TraceMessageSchema,
  trace_tool_runs: TraceToolRunSchema,
};

// Helper function to validate data against table schema
export function validateForTable<T extends keyof Database["public"]["Tables"]>(
  tableName: T,
  data: any
) {
  const schema = SchemaMap[tableName];
  if (!schema) {
    throw new Error(`No schema found for table: ${tableName}`);
  }
  return schema.parse(data);
}

// Helper function for safe parsing (returns success/error)
export function safeValidateForTable<T extends keyof Database["public"]["Tables"]>(
  tableName: T,
  data: any
) {
  const schema = SchemaMap[tableName];
  if (!schema) {
    return { success: false, error: `No schema found for table: ${tableName}` };
  }
  const result = schema.safeParse(data);
  return result;
}
// [AUTO-GEN-END]
// [AUTO-GEN-END]
