// [AUTO-GEN-START] Supabase Database Types
// Generated: 2025-11-05
// Strategy: Type definitions matching Supabase schema
// Source: supabase/migrations/20251105000000_safe_schema_complete.sql
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      claimants: {
        Row: {
          id: string
          full_name: string
          first_name: string | null
          last_name: string | null
          dob: string | null
          address: string | null
          suburb: string | null
          state: string
          postcode: string | null
          contact_number: string | null
          email: string | null
          abn: string | null
          acn: string | null
          amount: number | null
          entity_type: string | null
          source_state: string | null
          record_hash: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          first_name?: string | null
          last_name?: string | null
          dob?: string | null
          address?: string | null
          suburb?: string | null
          state: string
          postcode?: string | null
          contact_number?: string | null
          email?: string | null
          abn?: string | null
          acn?: string | null
          amount?: number | null
          entity_type?: string | null
          source_state?: string | null
          record_hash?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          first_name?: string | null
          last_name?: string | null
          dob?: string | null
          address?: string | null
          suburb?: string | null
          state?: string
          postcode?: string | null
          contact_number?: string | null
          email?: string | null
          abn?: string | null
          acn?: string | null
          amount?: number | null
          entity_type?: string | null
          source_state?: string | null
          record_hash?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          id: string
          claimant_id: string | null
          due_date: string
          description: string
          completed: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          claimant_id?: string | null
          due_date: string
          description: string
          completed?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          claimant_id?: string | null
          due_date?: string
          description?: string
          completed?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_claimant_id_fkey"
            columns: ["claimant_id"]
            referencedRelation: "claimants"
            referencedColumns: ["id"]
          }
        ]
      }
      pending_client_invites: {
        Row: {
          id: string
          email: string
          token: string
          role: string | null
          expires_at: string
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          email: string
          token: string
          role?: string | null
          expires_at: string
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          token?: string
          role?: string | null
          expires_at?: string
          created_by?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          context: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          context?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          context?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body: string
          variables: Json | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body: string
          variables?: Json | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          body?: string
          variables?: Json | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          claimant_id: string | null
          amount: number
          currency: string | null
          status: string | null
          payment_method: string | null
          paid_at: string | null
          reference: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          claimant_id?: string | null
          amount: number
          currency?: string | null
          status?: string | null
          payment_method?: string | null
          paid_at?: string | null
          reference?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          claimant_id?: string | null
          amount?: number
          currency?: string | null
          status?: string | null
          payment_method?: string | null
          paid_at?: string | null
          reference?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_claimant_id_fkey"
            columns: ["claimant_id"]
            referencedRelation: "claimants"
            referencedColumns: ["id"]
          }
        ]
      }
      timesheets: {
        Row: {
          id: string
          contractor_id: string
          week_start: string
          week_end: string
          total_hours: number
          hourly_rate: number | null
          total_amount: number | null
          status: string | null
          submitted_at: string | null
          approved_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          contractor_id: string
          week_start: string
          week_end: string
          total_hours: number
          hourly_rate?: number | null
          total_amount?: number | null
          status?: string | null
          submitted_at?: string | null
          approved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          contractor_id?: string
          week_start?: string
          week_end?: string
          total_hours?: number
          hourly_rate?: number | null
          total_amount?: number | null
          status?: string | null
          submitted_at?: string | null
          approved_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string | null
          content: string
          type: string | null
          read_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject?: string | null
          content: string
          type?: string | null
          read_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string | null
          content?: string
          type?: string | null
          read_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      xero_sync: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          external_id: string
          status: string | null
          last_synced_at: string | null
          sync_error: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          external_id: string
          status?: string | null
          last_synced_at?: string | null
          sync_error?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          external_id?: string
          status?: string | null
          last_synced_at?: string | null
          sync_error?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_messages: {
        Row: {
          id: string
          recipient: string
          body: string
          status: string | null
          sent_at: string | null
          delivered_at: string | null
          error_message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          recipient: string
          body: string
          status?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          recipient?: string
          body?: string
          status?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          id: string
          name: string
          body: string
          variables: Json | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          body: string
          variables?: Json | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          body?: string
          variables?: Json | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_messages: {
        Row: {
          id: string
          client_id: string
          subject: string
          message: string
          sent_by: string | null
          read_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          subject: string
          message: string
          sent_by?: string | null
          read_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          subject?: string
          message?: string
          sent_by?: string | null
          read_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          is_public: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          is_public?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          is_public?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          assigned_to: string | null
          claimant_id: string | null
          title: string
          description: string | null
          status: string | null
          priority: string | null
          due_date: string | null
          completed_at: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          assigned_to?: string | null
          claimant_id?: string | null
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          assigned_to?: string | null
          claimant_id?: string | null
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_claimant_id_fkey"
            columns: ["claimant_id"]
            referencedRelation: "claimants"
            referencedColumns: ["id"]
          }
        ]
      }
      company_essentials: {
        Row: {
          id: string
          abn: string
          acn: string | null
          trading_name: string
          legal_name: string | null
          director_name: string | null
          director_details: Json | null
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          abn: string
          acn?: string | null
          trading_name: string
          legal_name?: string | null
          director_name?: string | null
          director_details?: Json | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          abn?: string
          acn?: string | null
          trading_name?: string
          legal_name?: string | null
          director_name?: string | null
          director_details?: Json | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trace_history: {
        Row: {
          id: string
          claimant_id: string | null
          trace_agent: string
          status: string | null
          result_json: Json | null
          confidence_score: number | null
          execution_time_ms: number | null
          error_message: string | null
          created_by: string | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          claimant_id?: string | null
          trace_agent: string
          status?: string | null
          result_json?: Json | null
          confidence_score?: number | null
          execution_time_ms?: number | null
          error_message?: string | null
          created_by?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          claimant_id?: string | null
          trace_agent?: string
          status?: string | null
          result_json?: Json | null
          confidence_score?: number | null
          execution_time_ms?: number | null
          error_message?: string | null
          created_by?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trace_history_claimant_id_fkey"
            columns: ["claimant_id"]
            referencedRelation: "claimants"
            referencedColumns: ["id"]
          }
        ]
      }
      claim_notes: {
        Row: {
          id: string
          claimant_id: string
          note: string
          note_type: string | null
          is_internal: boolean | null
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          claimant_id: string
          note: string
          note_type?: string | null
          is_internal?: boolean | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          claimant_id?: string
          note?: string
          note_type?: string | null
          is_internal?: boolean | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_notes_claimant_id_fkey"
            columns: ["claimant_id"]
            referencedRelation: "claimants"
            referencedColumns: ["id"]
          }
        ]
      }
      trace_conversations: {
        Row: {
          id: string
          title: string
          status: string | null
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          status?: string | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          status?: string | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trace_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trace_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "trace_conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      trace_tool_runs: {
        Row: {
          id: string
          conversation_id: string
          message_id: string | null
          name: string
          args: Json
          result: Json | null
          status: string | null
          error: string | null
          execution_time_ms: number | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          message_id?: string | null
          name: string
          args: Json
          result?: Json | null
          status?: string | null
          error?: string | null
          execution_time_ms?: number | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          message_id?: string | null
          name?: string
          args?: Json
          result?: Json | null
          status?: string | null
          error?: string | null
          execution_time_ms?: number | null
          created_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trace_tool_runs_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "trace_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trace_tool_runs_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "trace_messages"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
// [AUTO-GEN-END]
