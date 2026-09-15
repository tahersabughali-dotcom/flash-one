export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_onboarding: {
        Row: {
          created_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          pending_suggestion: Json | null
          public_id: string
          purpose: string
          status: string
          suggestion_consumed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pending_suggestion?: Json | null
          public_id?: string
          purpose?: string
          status?: string
          suggestion_consumed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pending_suggestion?: Json | null
          public_id?: string
          purpose?: string
          status?: string
          suggestion_consumed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          created_by_user_id: string | null
          id: string
          public_id: string
          role: string
          structured_suggestion: Json | null
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          public_id?: string
          role: string
          structured_suggestion?: Json | null
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          public_id?: string
          role?: string
          structured_suggestion?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          capabilities: Json
          code: string
          display_name: string
          model_identifier: string | null
          notes: string | null
          operational_state: string
          updated_at: string
        }
        Insert: {
          capabilities?: Json
          code: string
          display_name: string
          model_identifier?: string | null
          notes?: string | null
          operational_state: string
          updated_at?: string
        }
        Update: {
          capabilities?: Json
          code?: string
          display_name?: string
          model_identifier?: string | null
          notes?: string | null
          operational_state?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          occurred_at: string
          request_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          request_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          request_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action_type: string
          configuration: Json
          created_at: string
          created_by_user_id: string | null
          enabled: boolean
          event_type: string
          id: string
          name: string
          public_id: string
          updated_at: string
        }
        Insert: {
          action_type: string
          configuration?: Json
          created_at?: string
          created_by_user_id?: string | null
          enabled?: boolean
          event_type: string
          id?: string
          name: string
          public_id?: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          configuration?: Json
          created_at?: string
          created_by_user_id?: string | null
          enabled?: boolean
          event_type?: string
          id?: string
          name?: string
          public_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          attempt_count: number
          error_summary: string | null
          event_id: string
          finished_at: string | null
          id: string
          public_id: string
          rule_id: string
          started_at: string
          status: string
        }
        Insert: {
          attempt_count?: number
          error_summary?: string | null
          event_id: string
          finished_at?: string | null
          id?: string
          public_id?: string
          rule_id: string
          started_at?: string
          status: string
        }
        Update: {
          attempt_count?: number
          error_summary?: string | null
          event_id?: string
          finished_at?: string | null
          id?: string
          public_id?: string
          rule_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "domain_outbox_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          acknowledgment_text: string
          commercial_snapshot: Json
          created_at: string
          document_type: string
          effective_date: string | null
          id: string
          project_id: string
          public_id: string
          quote_id: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          acknowledgment_text: string
          commercial_snapshot?: Json
          created_at?: string
          document_type: string
          effective_date?: string | null
          id?: string
          project_id: string
          public_id?: string
          quote_id: string
          status?: string
          title: string
          updated_at?: string
          version: number
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          acknowledgment_text?: string
          commercial_snapshot?: Json
          created_at?: string
          document_type?: string
          effective_date?: string | null
          id?: string
          project_id?: string
          public_id?: string
          quote_id?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          public_id: string
          sender_kind: string
          sender_user_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          public_id?: string
          sender_kind: string
          sender_user_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          public_id?: string
          sender_kind?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          project_id: string
          public_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          public_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          public_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_files: {
        Row: {
          deliverable_id: string
          file_id: string
          position: number
        }
        Insert: {
          deliverable_id: string
          file_id: string
          position: number
        }
        Update: {
          deliverable_id?: string
          file_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_files_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "project_files"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          change_request_note: string | null
          created_at: string
          description: string | null
          file_snapshot: Json
          id: string
          project_id: string
          public_id: string
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          change_request_note?: string | null
          created_at?: string
          description?: string | null
          file_snapshot?: Json
          id?: string
          project_id: string
          public_id?: string
          status?: string
          submitted_at?: string | null
          title: string
          updated_at?: string
          version: number
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          change_request_note?: string | null
          created_at?: string
          description?: string | null
          file_snapshot?: Json
          id?: string
          project_id?: string
          public_id?: string
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_links: {
        Row: {
          created_at: string
          developer_user_id: string
          id: string
          label: string
          position: number
          url: string
        }
        Insert: {
          created_at?: string
          developer_user_id: string
          id?: string
          label: string
          position?: number
          url: string
        }
        Update: {
          created_at?: string
          developer_user_id?: string
          id?: string
          label?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_links_developer_user_id_fkey"
            columns: ["developer_user_id"]
            isOneToOne: false
            referencedRelation: "developer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      developer_profiles: {
        Row: {
          availability_status: string
          bio: string | null
          country: string | null
          created_at: string
          display_name: string
          headline: string | null
          public_id: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_status?: string
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name: string
          headline?: string | null
          public_id?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_status?: string
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          headline?: string | null
          public_id?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_skills: {
        Row: {
          created_at: string
          developer_user_id: string
          id: string
          position: number
          skill: string
        }
        Insert: {
          created_at?: string
          developer_user_id: string
          id?: string
          position?: number
          skill: string
        }
        Update: {
          created_at?: string
          developer_user_id?: string
          id?: string
          position?: number
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_skills_developer_user_id_fkey"
            columns: ["developer_user_id"]
            isOneToOne: false
            referencedRelation: "developer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      domain_outbox_events: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          attempt_count: number
          event_type: string
          id: string
          last_error: string | null
          occurred_at: string
          processed_at: string | null
          processing_status: string
          safe_payload: Json
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          attempt_count?: number
          event_type: string
          id?: string
          last_error?: string | null
          occurred_at?: string
          processed_at?: string | null
          processing_status?: string
          safe_payload?: Json
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          attempt_count?: number
          event_type?: string
          id?: string
          last_error?: string | null
          occurred_at?: string
          processed_at?: string | null
          processing_status?: string
          safe_payload?: Json
        }
        Relationships: []
      }
      financial_ledger_entries: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          direction: string
          event_type: string
          id: string
          invoice_id: string | null
          occurred_at: string
          payment_id: string | null
          public_id: string
          receipt_id: string | null
          source_reference: string | null
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency: string
          direction: string
          event_type: string
          id?: string
          invoice_id?: string | null
          occurred_at?: string
          payment_id?: string | null
          public_id?: string
          receipt_id?: string | null
          source_reference?: string | null
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          direction?: string
          event_type?: string
          id?: string
          invoice_id?: string | null
          occurred_at?: string
          payment_id?: string | null
          public_id?: string
          receipt_id?: string | null
          source_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_ledger_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_entries_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_entries_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_accounts: {
        Row: {
          created_at: string
          public_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          public_id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          public_id?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          line_total_minor: number
          position: number
          quantity: number
          unit_amount_minor: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          line_total_minor: number
          position: number
          quantity: number
          unit_amount_minor: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          line_total_minor?: number
          position?: number
          quantity?: number
          unit_amount_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid_minor: number
          billing_snapshot: Json
          contract_id: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          customer_snapshot: Json
          due_date: string | null
          id: string
          individual_user_id: string | null
          invoice_number: string | null
          issue_date: string | null
          issued_at: string | null
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          project_id: string | null
          public_id: string
          quote_id: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by_user_id: string | null
        }
        Insert: {
          amount_paid_minor?: number
          billing_snapshot?: Json
          contract_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency: string
          customer_snapshot?: Json
          due_date?: string | null
          id?: string
          individual_user_id?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          issued_at?: string | null
          notes?: string | null
          organization_id?: string | null
          paid_at?: string | null
          project_id?: string | null
          public_id?: string
          quote_id?: string | null
          status?: string
          subtotal_minor?: number
          tax_minor?: number
          total_minor?: number
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by_user_id?: string | null
        }
        Update: {
          amount_paid_minor?: number
          billing_snapshot?: Json
          contract_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency?: string
          customer_snapshot?: Json
          due_date?: string | null
          id?: string
          individual_user_id?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          issued_at?: string | null
          notes?: string | null
          organization_id?: string | null
          paid_at?: string | null
          project_id?: string | null
          public_id?: string
          quote_id?: string | null
          status?: string
          subtotal_minor?: number
          tax_minor?: number
          total_minor?: number
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_individual_user_id_fkey"
            columns: ["individual_user_id"]
            isOneToOne: false
            referencedRelation: "individual_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          public_id: string
          read_at: string | null
          recipient_user_id: string
          source_public_id: string | null
          source_type: string | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          public_id?: string
          read_at?: string | null
          recipient_user_id: string
          source_public_id?: string | null
          source_type?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          public_id?: string
          read_at?: string | null
          recipient_user_id?: string
          source_public_id?: string | null
          source_type?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          created_by_user_id: string
          expires_at: string
          id: string
          invited_email: string
          organization_id: string
          public_id: string
          revoked_at: string | null
          role: string
          status: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          created_by_user_id: string
          expires_at: string
          id?: string
          invited_email: string
          organization_id: string
          public_id?: string
          revoked_at?: string | null
          role?: string
          status?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          created_by_user_id?: string
          expires_at?: string
          id?: string
          invited_email?: string
          organization_id?: string
          public_id?: string
          revoked_at?: string | null
          role?: string
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          public_id: string
          updated_at: string
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          public_id?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          public_id?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      payment_allocations: {
        Row: {
          allocated_at: string
          allocated_by_user_id: string | null
          amount_minor: number
          id: string
          invoice_id: string
          payment_id: string
        }
        Insert: {
          allocated_at?: string
          allocated_by_user_id?: string | null
          amount_minor: number
          id?: string
          invoice_id: string
          payment_id: string
        }
        Update: {
          allocated_at?: string
          allocated_by_user_id?: string | null
          amount_minor?: number
          id?: string
          invoice_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          amount_minor: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          ingest_key_hash: string
          payment_id: string | null
          payment_request_id: string
          provider: string
          provider_session_reference: string | null
          public_id: string
          review_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_minor: number
          completed_at?: string | null
          created_at?: string
          currency: string
          id?: string
          ingest_key_hash: string
          payment_id?: string | null
          payment_request_id: string
          provider: string
          provider_session_reference?: string | null
          public_id?: string
          review_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_minor?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          ingest_key_hash?: string
          payment_id?: string | null
          payment_request_id?: string
          provider?: string
          provider_session_reference?: string | null
          public_id?: string
          review_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_attempts_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_attempts_provider_fkey"
            columns: ["provider"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["code"]
          },
        ]
      }
      payment_provider_events: {
        Row: {
          amount_minor: number | null
          attempt_id: string | null
          currency: string | null
          error_state: string | null
          event_type: string
          external_event_id: string
          id: string
          payment_id: string | null
          processing_status: string
          provider: string
          provider_reference: string | null
          received_at: string
          safe_metadata: Json
          verified_at: string | null
        }
        Insert: {
          amount_minor?: number | null
          attempt_id?: string | null
          currency?: string | null
          error_state?: string | null
          event_type: string
          external_event_id: string
          id?: string
          payment_id?: string | null
          processing_status?: string
          provider: string
          provider_reference?: string | null
          received_at?: string
          safe_metadata?: Json
          verified_at?: string | null
        }
        Update: {
          amount_minor?: number | null
          attempt_id?: string | null
          currency?: string | null
          error_state?: string | null
          event_type?: string
          external_event_id?: string
          id?: string
          payment_id?: string | null
          processing_status?: string
          provider?: string
          provider_reference?: string | null
          received_at?: string
          safe_metadata?: Json
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_provider_events_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "payment_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_provider_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_provider_events_provider_fkey"
            columns: ["provider"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["code"]
          },
        ]
      }
      payment_providers: {
        Row: {
          capabilities: Json
          code: string
          display_name: string
          eligibility: string
          notes: string | null
          operational_state: string
          supported_currencies: string[]
          updated_at: string
        }
        Insert: {
          capabilities: Json
          code: string
          display_name: string
          eligibility: string
          notes?: string | null
          operational_state: string
          supported_currencies: string[]
          updated_at?: string
        }
        Update: {
          capabilities?: Json
          code?: string
          display_name?: string
          eligibility?: string
          notes?: string | null
          operational_state?: string
          supported_currencies?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount_mode: string
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          description: string | null
          expires_at: string | null
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          invoice_id: string | null
          max_amount_minor: number | null
          min_amount_minor: number | null
          organization_id: string | null
          public_id: string
          requested_amount_minor: number | null
          service_code: string | null
          service_snapshot: Json
          status: string
          updated_at: string
        }
        Insert: {
          amount_mode: string
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency: string
          description?: string | null
          expires_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          individual_user_id?: string | null
          invoice_id?: string | null
          max_amount_minor?: number | null
          min_amount_minor?: number | null
          organization_id?: string | null
          public_id?: string
          requested_amount_minor?: number | null
          service_code?: string | null
          service_snapshot?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          amount_mode?: string
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency?: string
          description?: string | null
          expires_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          individual_user_id?: string | null
          invoice_id?: string | null
          max_amount_minor?: number | null
          min_amount_minor?: number | null
          organization_id?: string | null
          public_id?: string
          requested_amount_minor?: number | null
          service_code?: string | null
          service_snapshot?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_individual_user_id_fkey"
            columns: ["individual_user_id"]
            isOneToOne: false
            referencedRelation: "individual_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_runtime_settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_minor: number
          created_at: string
          created_by_user_id: string | null
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          organization_id: string | null
          payment_attempt_id: string | null
          payment_request_id: string | null
          provider: string | null
          provider_reference: string | null
          public_id: string
          received_at: string | null
          review_required: boolean
          source_type: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          created_by_user_id?: string | null
          currency: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          individual_user_id?: string | null
          organization_id?: string | null
          payment_attempt_id?: string | null
          payment_request_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          public_id?: string
          received_at?: string | null
          review_required?: boolean
          source_type: string
          status: string
          updated_at?: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          created_by_user_id?: string | null
          currency?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          individual_user_id?: string | null
          organization_id?: string | null
          payment_attempt_id?: string | null
          payment_request_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          public_id?: string
          received_at?: string | null
          review_required?: boolean
          source_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_individual_user_id_fkey"
            columns: ["individual_user_id"]
            isOneToOne: false
            referencedRelation: "individual_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_attempt_id_fkey"
            columns: ["payment_attempt_id"]
            isOneToOne: true
            referencedRelation: "payment_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_activity: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: string
          id: string
          label: string
          project_id: string
          visibility: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          label: string
          project_id: string
          visibility: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          label?: string
          project_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_developer_assignments: {
        Row: {
          assigned_at: string
          assigned_by_user_id: string
          assignment_role: string
          created_at: string
          developer_user_id: string
          id: string
          project_id: string
          status: string
          unassigned_at: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by_user_id: string
          assignment_role?: string
          created_at?: string
          developer_user_id: string
          id?: string
          project_id: string
          status?: string
          unassigned_at?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by_user_id?: string
          assignment_role?: string
          created_at?: string
          developer_user_id?: string
          id?: string
          project_id?: string
          status?: string
          unassigned_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_developer_assignments_developer_user_id_fkey"
            columns: ["developer_user_id"]
            isOneToOne: false
            referencedRelation: "developer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "project_developer_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          mime_type: string
          original_filename: string
          project_id: string
          public_id: string
          size_bytes: number
          storage_bucket: string
          storage_path: string
          uploaded_by_user_id: string
          visibility: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          mime_type: string
          original_filename: string
          project_id: string
          public_id?: string
          size_bytes: number
          storage_bucket?: string
          storage_path: string
          uploaded_by_user_id: string
          visibility: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          mime_type?: string
          original_filename?: string
          project_id?: string
          public_id?: string
          size_bytes?: number
          storage_bucket?: string
          storage_path?: string
          uploaded_by_user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          customer_visible: boolean
          description: string | null
          due_at: string | null
          id: string
          priority: string
          project_id: string
          public_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          customer_visible?: boolean
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string
          project_id: string
          public_id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          customer_visible?: boolean
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string
          project_id?: string
          public_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          accepted_quote_id: string
          completed_at: string | null
          created_at: string
          id: string
          individual_user_id: string | null
          name: string
          organization_id: string | null
          public_id: string
          started_at: string | null
          status: string
          target_completion_at: string | null
          updated_at: string
          work_request_id: string
        }
        Insert: {
          accepted_quote_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          individual_user_id?: string | null
          name: string
          organization_id?: string | null
          public_id?: string
          started_at?: string | null
          status?: string
          target_completion_at?: string | null
          updated_at?: string
          work_request_id: string
        }
        Update: {
          accepted_quote_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          individual_user_id?: string | null
          name?: string
          organization_id?: string | null
          public_id?: string
          started_at?: string | null
          status?: string
          target_completion_at?: string | null
          updated_at?: string
          work_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_accepted_quote_id_fkey"
            columns: ["accepted_quote_id"]
            isOneToOne: true
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_individual_user_id_fkey"
            columns: ["individual_user_id"]
            isOneToOne: false
            referencedRelation: "individual_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_work_request_id_fkey"
            columns: ["work_request_id"]
            isOneToOne: true
            referencedRelation: "work_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_line_items: {
        Row: {
          description: string
          id: string
          line_total_minor: number
          position: number
          quantity: number
          quote_id: string
          unit_amount_minor: number
        }
        Insert: {
          description: string
          id?: string
          line_total_minor: number
          position: number
          quantity: number
          quote_id: string
          unit_amount_minor: number
        }
        Update: {
          description?: string
          id?: string
          line_total_minor?: number
          position?: number
          quantity?: number
          quote_id?: string
          unit_amount_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          currency: string
          customer_notes: string | null
          id: string
          public_id: string
          rejected_at: string | null
          rejected_by_user_id: string | null
          sent_at: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          valid_until: string | null
          version: number
          work_request_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          currency: string
          customer_notes?: string | null
          id?: string
          public_id?: string
          rejected_at?: string | null
          rejected_by_user_id?: string | null
          sent_at?: string | null
          status?: string
          subtotal_minor: number
          tax_minor?: number
          total_minor: number
          updated_at?: string
          valid_until?: string | null
          version: number
          work_request_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          currency?: string
          customer_notes?: string | null
          id?: string
          public_id?: string
          rejected_at?: string | null
          rejected_by_user_id?: string | null
          sent_at?: string | null
          status?: string
          subtotal_minor?: number
          tax_minor?: number
          total_minor?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
          work_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_work_request_id_fkey"
            columns: ["work_request_id"]
            isOneToOne: false
            referencedRelation: "work_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          issued_at: string
          organization_id: string | null
          payment_id: string
          public_id: string
          receipt_number: string
          snapshot: Json
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          individual_user_id?: string | null
          issued_at?: string
          organization_id?: string | null
          payment_id: string
          public_id: string
          receipt_number: string
          snapshot: Json
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          individual_user_id?: string | null
          issued_at?: string
          organization_id?: string | null
          payment_id?: string
          public_id?: string
          receipt_number?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "receipts_individual_user_id_fkey"
            columns: ["individual_user_id"]
            isOneToOne: false
            referencedRelation: "individual_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "receipts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliation_items: {
        Row: {
          amount_minor: number
          created_at: string
          created_by_user_id: string | null
          currency: string
          external_reference: string | null
          id: string
          matched_payment_id: string | null
          notes: string | null
          occurred_at: string
          public_id: string
          reconciled_at: string | null
          reconciled_by_user_id: string | null
          source_type: string
          status: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          created_by_user_id?: string | null
          currency: string
          external_reference?: string | null
          id?: string
          matched_payment_id?: string | null
          notes?: string | null
          occurred_at?: string
          public_id?: string
          reconciled_at?: string | null
          reconciled_by_user_id?: string | null
          source_type: string
          status?: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          created_by_user_id?: string | null
          currency?: string
          external_reference?: string | null
          id?: string
          matched_payment_id?: string | null
          notes?: string | null
          occurred_at?: string
          public_id?: string
          reconciled_at?: string | null
          reconciled_by_user_id?: string | null
          source_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_items_matched_payment_id_fkey"
            columns: ["matched_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      store_order_items: {
        Row: {
          created_at: string
          id: string
          line_total_minor: number
          order_id: string
          product_id: string | null
          product_name: string
          product_public_id: string
          product_type: string
          quantity: number
          unit_price_minor: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total_minor: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_public_id: string
          product_type: string
          quantity: number
          unit_price_minor: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total_minor?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_public_id?: string
          product_type?: string
          quantity?: number
          unit_price_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          access_key_hash: string | null
          completed_at: string | null
          created_at: string
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          invoice_id: string | null
          organization_id: string | null
          paid_at: string | null
          payment_request_id: string | null
          public_id: string
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
        }
        Insert: {
          access_key_hash?: string | null
          completed_at?: string | null
          created_at?: string
          currency: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          individual_user_id?: string | null
          invoice_id?: string | null
          organization_id?: string | null
          paid_at?: string | null
          payment_request_id?: string | null
          public_id?: string
          status?: string
          subtotal_minor: number
          tax_minor?: number
          total_minor: number
          updated_at?: string
        }
        Update: {
          access_key_hash?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          individual_user_id?: string | null
          invoice_id?: string | null
          organization_id?: string | null
          paid_at?: string | null
          payment_request_id?: string | null
          public_id?: string
          status?: string
          subtotal_minor?: number
          tax_minor?: number
          total_minor?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_orders_individual_user_id_fkey"
            columns: ["individual_user_id"]
            isOneToOne: false
            referencedRelation: "individual_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "store_orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_orders_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      store_product_prices: {
        Row: {
          active: boolean
          amount_minor: number
          created_at: string
          currency: string
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount_minor: number
          created_at?: string
          currency: string
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount_minor?: number
          created_at?: string
          currency?: string
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          commercial_mode: string
          created_at: string
          customer_visible: boolean
          description: string | null
          id: string
          name: string
          product_type: string
          public_id: string
          quantity_mode: string
          short_description: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          commercial_mode: string
          created_at?: string
          customer_visible?: boolean
          description?: string | null
          id?: string
          name: string
          product_type: string
          public_id?: string
          quantity_mode?: string
          short_description: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          commercial_mode?: string
          created_at?: string
          customer_visible?: boolean
          description?: string | null
          id?: string
          name?: string
          product_type?: string
          public_id?: string
          quantity_mode?: string
          short_description?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_platform_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      work_requests: {
        Row: {
          budget_indication: string | null
          created_at: string
          created_by_user_id: string | null
          desired_timeline: string | null
          details: string | null
          id: string
          individual_user_id: string | null
          organization_id: string | null
          public_id: string
          service_category: string
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_indication?: string | null
          created_at?: string
          created_by_user_id?: string | null
          desired_timeline?: string | null
          details?: string | null
          id?: string
          individual_user_id?: string | null
          organization_id?: string | null
          public_id?: string
          service_category: string
          status?: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          budget_indication?: string | null
          created_at?: string
          created_by_user_id?: string | null
          desired_timeline?: string | null
          details?: string | null
          id?: string
          individual_user_id?: string | null
          organization_id?: string | null
          public_id?: string
          service_category?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_requests_individual_user_id_fkey"
            columns: ["individual_user_id"]
            isOneToOne: false
            referencedRelation: "individual_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "work_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_contract: {
        Args: { p_contract_id: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          acknowledgment_text: string
          commercial_snapshot: Json
          created_at: string
          document_type: string
          effective_date: string | null
          id: string
          project_id: string
          public_id: string
          quote_id: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "contracts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      accept_deliverable: {
        Args: { p_deliverable_id: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          change_request_note: string | null
          created_at: string
          description: string | null
          file_snapshot: Json
          id: string
          project_id: string
          public_id: string
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "deliverables"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      accept_organization_invitation: {
        Args: { p_token: string }
        Returns: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "organization_memberships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      accept_quote: { Args: { p_quote_id: string }; Returns: Json }
      actor_is_request_customer: {
        Args: {
          p_actor: string
          p_request: Database["public"]["Tables"]["work_requests"]["Row"]
        }
        Returns: boolean
      }
      admin_allocate_payment: {
        Args: {
          p_amount_minor: number
          p_invoice_id: string
          p_payment_id: string
        }
        Returns: {
          allocated_at: string
          allocated_by_user_id: string | null
          amount_minor: number
          id: string
          invoice_id: string
          payment_id: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_allocations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_assign_project_developer: {
        Args: { p_developer_user_id: string; p_project_id: string }
        Returns: {
          assigned_at: string
          assigned_by_user_id: string
          assignment_role: string
          created_at: string
          developer_user_id: string
          id: string
          project_id: string
          status: string
          unassigned_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "project_developer_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_confirm_reconciliation_item: {
        Args: { p_item_id: string }
        Returns: {
          amount_minor: number
          created_at: string
          created_by_user_id: string | null
          currency: string
          external_reference: string | null
          id: string
          matched_payment_id: string | null
          notes: string | null
          occurred_at: string
          public_id: string
          reconciled_at: string | null
          reconciled_by_user_id: string | null
          source_type: string
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "reconciliation_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_deliverable: {
        Args: { p_description: string; p_project_id: string; p_title: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          change_request_note: string | null
          created_at: string
          description: string | null
          file_snapshot: Json
          id: string
          project_id: string
          public_id: string
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "deliverables"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_invoice: {
        Args: {
          p_contract_public_id: string
          p_currency: string
          p_due_date: string
          p_individual_public_id: string
          p_lines: Json
          p_notes: string
          p_organization_public_id: string
          p_project_public_id: string
          p_quote_public_id: string
        }
        Returns: {
          amount_paid_minor: number
          billing_snapshot: Json
          contract_id: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          customer_snapshot: Json
          due_date: string | null
          id: string
          individual_user_id: string | null
          invoice_number: string | null
          issue_date: string | null
          issued_at: string | null
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          project_id: string | null
          public_id: string
          quote_id: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by_user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_payment_request: {
        Args: {
          p_amount_mode: string
          p_currency: string
          p_description: string
          p_expires_at: string
          p_guest_email: string
          p_guest_name: string
          p_individual_public_id: string
          p_invoice_public_id: string
          p_max_amount_minor: number
          p_min_amount_minor: number
          p_organization_public_id: string
          p_requested_amount_minor: number
          p_service_code: string
        }
        Returns: {
          amount_mode: string
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          description: string | null
          expires_at: string | null
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          invoice_id: string | null
          max_amount_minor: number | null
          min_amount_minor: number | null
          organization_id: string | null
          public_id: string
          requested_amount_minor: number | null
          service_code: string | null
          service_snapshot: Json
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_project_task: {
        Args: {
          p_customer_visible: boolean
          p_description: string
          p_due_at: string
          p_priority: string
          p_project_id: string
          p_status: string
          p_title: string
        }
        Returns: {
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          customer_visible: boolean
          description: string | null
          due_at: string | null
          id: string
          priority: string
          project_id: string
          public_id: string
          status: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "project_tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_reconciliation_item: {
        Args: { p_amount_minor: number; p_currency: string; p_notes: string }
        Returns: {
          amount_minor: number
          created_at: string
          created_by_user_id: string | null
          currency: string
          external_reference: string | null
          id: string
          matched_payment_id: string | null
          notes: string | null
          occurred_at: string
          public_id: string
          reconciled_at: string | null
          reconciled_by_user_id: string | null
          source_type: string
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "reconciliation_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_issue_invoice: {
        Args: { p_invoice_id: string }
        Returns: {
          amount_paid_minor: number
          billing_snapshot: Json
          contract_id: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          customer_snapshot: Json
          due_date: string | null
          id: string
          individual_user_id: string | null
          invoice_number: string | null
          issue_date: string | null
          issued_at: string | null
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          project_id: string | null
          public_id: string
          quote_id: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by_user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_issue_quote: {
        Args: {
          p_currency: string
          p_customer_notes: string
          p_lines: Json
          p_valid_until: string
          p_work_request_id: string
        }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          currency: string
          customer_notes: string | null
          id: string
          public_id: string
          rejected_at: string | null
          rejected_by_user_id: string | null
          sent_at: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          valid_until: string | null
          version: number
          work_request_id: string
        }
        SetofOptions: {
          from: "*"
          to: "quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_issue_receipt: {
        Args: { p_payment_id: string }
        Returns: {
          amount_minor: number
          created_at: string
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          issued_at: string
          organization_id: string | null
          payment_id: string
          public_id: string
          receipt_number: string
          snapshot: Json
        }
        SetofOptions: {
          from: "*"
          to: "receipts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_match_reconciliation_item: {
        Args: { p_item_id: string; p_payment_id: string }
        Returns: {
          amount_minor: number
          created_at: string
          created_by_user_id: string | null
          currency: string
          external_reference: string | null
          id: string
          matched_payment_id: string | null
          notes: string | null
          occurred_at: string
          public_id: string
          reconciled_at: string | null
          reconciled_by_user_id: string | null
          source_type: string
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "reconciliation_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_record_manual_payment: {
        Args: {
          p_amount_minor: number
          p_currency: string
          p_individual_public_id: string
          p_organization_public_id: string
        }
        Returns: {
          amount_minor: number
          created_at: string
          created_by_user_id: string | null
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          organization_id: string | null
          payment_attempt_id: string | null
          payment_request_id: string | null
          provider: string | null
          provider_reference: string | null
          public_id: string
          received_at: string | null
          review_required: boolean
          source_type: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_ai_provider_state: {
        Args: { p_code: string; p_operational_state: string }
        Returns: {
          capabilities: Json
          code: string
          display_name: string
          model_identifier: string | null
          notes: string | null
          operational_state: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "ai_providers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_automation_rule_enabled: {
        Args: { p_enabled: boolean; p_public_id: string }
        Returns: {
          action_type: string
          configuration: Json
          created_at: string
          created_by_user_id: string | null
          enabled: boolean
          event_type: string
          id: string
          name: string
          public_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_deliverable_files: {
        Args: { p_deliverable_id: string; p_file_ids: string[] }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          change_request_note: string | null
          created_at: string
          description: string | null
          file_snapshot: Json
          id: string
          project_id: string
          public_id: string
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "deliverables"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_invoice_lines: {
        Args: { p_invoice_id: string; p_lines: Json }
        Returns: {
          amount_paid_minor: number
          billing_snapshot: Json
          contract_id: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          customer_snapshot: Json
          due_date: string | null
          id: string
          individual_user_id: string | null
          invoice_number: string | null
          issue_date: string | null
          issued_at: string | null
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          project_id: string | null
          public_id: string
          quote_id: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by_user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_payment_request_status: {
        Args: { p_request_id: string; p_status: string }
        Returns: {
          amount_mode: string
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          description: string | null
          expires_at: string | null
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          invoice_id: string | null
          max_amount_minor: number | null
          min_amount_minor: number | null
          organization_id: string | null
          public_id: string
          requested_amount_minor: number | null
          service_code: string | null
          service_snapshot: Json
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_provider_state: {
        Args: { p_code: string; p_operational_state: string }
        Returns: {
          capabilities: Json
          code: string
          display_name: string
          eligibility: string
          notes: string | null
          operational_state: string
          supported_currencies: string[]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_providers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_store_order_status: {
        Args: { p_public_id: string; p_status: string }
        Returns: {
          access_key_hash: string | null
          completed_at: string | null
          created_at: string
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          invoice_id: string | null
          organization_id: string | null
          paid_at: string | null
          payment_request_id: string | null
          public_id: string
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "store_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_store_product_price: {
        Args: {
          p_active: boolean
          p_amount_minor: number
          p_currency: string
          p_product_public_id: string
        }
        Returns: {
          active: boolean
          amount_minor: number
          created_at: string
          currency: string
          id: string
          product_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "store_product_prices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_store_product_status: {
        Args: { p_public_id: string; p_status: string }
        Returns: {
          commercial_mode: string
          created_at: string
          customer_visible: boolean
          description: string | null
          id: string
          name: string
          product_type: string
          public_id: string
          quantity_mode: string
          short_description: string
          slug: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "store_products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_submit_deliverable: {
        Args: { p_deliverable_id: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          change_request_note: string | null
          created_at: string
          description: string | null
          file_snapshot: Json
          id: string
          project_id: string
          public_id: string
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "deliverables"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_unassign_project_developer: {
        Args: { p_developer_user_id: string; p_project_id: string }
        Returns: {
          assigned_at: string
          assigned_by_user_id: string
          assignment_role: string
          created_at: string
          developer_user_id: string
          id: string
          project_id: string
          status: string
          unassigned_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "project_developer_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_project_status: {
        Args: { p_project_id: string; p_status: string }
        Returns: {
          accepted_quote_id: string
          completed_at: string | null
          created_at: string
          id: string
          individual_user_id: string | null
          name: string
          organization_id: string | null
          public_id: string
          started_at: string | null
          status: string
          target_completion_at: string | null
          updated_at: string
          work_request_id: string
        }
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_project_task: {
        Args: {
          p_customer_visible: boolean
          p_description: string
          p_due_at: string
          p_priority: string
          p_status: string
          p_task_id: string
          p_title: string
        }
        Returns: {
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          customer_visible: boolean
          description: string | null
          due_at: string | null
          id: string
          priority: string
          project_id: string
          public_id: string
          status: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "project_tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_work_request_status: {
        Args: { p_status: string; p_work_request_id: string }
        Returns: {
          budget_indication: string | null
          created_at: string
          created_by_user_id: string | null
          desired_timeline: string | null
          details: string | null
          id: string
          individual_user_id: string | null
          organization_id: string | null
          public_id: string
          service_category: string
          status: string
          summary: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "work_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_upsert_store_product: {
        Args: {
          p_commercial_mode: string
          p_customer_visible: boolean
          p_description: string
          p_name: string
          p_product_type: string
          p_public_id: string
          p_quantity_mode: string
          p_short_description: string
          p_slug: string
        }
        Returns: {
          commercial_mode: string
          created_at: string
          customer_visible: boolean
          description: string | null
          id: string
          name: string
          product_type: string
          public_id: string
          quantity_mode: string
          short_description: string
          slug: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "store_products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_void_invoice: {
        Args: { p_invoice_id: string; p_reason: string }
        Returns: {
          amount_paid_minor: number
          billing_snapshot: Json
          contract_id: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          customer_snapshot: Json
          due_date: string | null
          id: string
          individual_user_id: string | null
          invoice_number: string | null
          issue_date: string | null
          issued_at: string | null
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          project_id: string | null
          public_id: string
          quote_id: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by_user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assert_platform_admin: { Args: never; Returns: string }
      can_access_ai_conversation: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      can_access_invoice: { Args: { p_invoice_id: string }; Returns: boolean }
      can_access_payment: { Args: { p_payment_id: string }; Returns: boolean }
      can_access_payment_request: {
        Args: { p_request_id: string }
        Returns: boolean
      }
      can_access_project: { Args: { p_project_id: string }; Returns: boolean }
      can_access_store_order: { Args: { p_order_id: string }; Returns: boolean }
      can_access_work_request: {
        Args: { p_request_id: string }
        Returns: boolean
      }
      canonical_upload_mime: { Args: { p_filename: string }; Returns: string }
      confirm_ai_work_request_suggestion: {
        Args: { p_conversation_public_id: string; p_owner: string }
        Returns: Json
      }
      confirm_project_file_upload: {
        Args: { p_file_id: string }
        Returns: {
          confirmed_at: string | null
          created_at: string
          id: string
          mime_type: string
          original_filename: string
          project_id: string
          public_id: string
          size_bytes: number
          storage_bucket: string
          storage_path: string
          uploaded_by_user_id: string
          visibility: string
        }
        SetofOptions: {
          from: "*"
          to: "project_files"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_ai_conversation: {
        Args: { p_purpose: string }
        Returns: {
          created_at: string
          id: string
          pending_suggestion: Json | null
          public_id: string
          purpose: string
          status: string
          suggestion_consumed_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ai_conversations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_organization: {
        Args: { p_name: string }
        Returns: {
          country: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          public_id: string
          updated_at: string
          website: string | null
        }
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_organization_invitation: {
        Args: { p_email: string; p_organization_id: string }
        Returns: Json
      }
      create_payment_attempt: {
        Args: {
          p_amount_minor: number
          p_guest_email: string
          p_guest_name: string
          p_provider: string
          p_request_public_id: string
        }
        Returns: Json
      }
      create_store_order: {
        Args: {
          p_currency: string
          p_guest_email: string
          p_guest_name: string
          p_organization_public_id: string
          p_product_public_id: string
          p_quantity: number
        }
        Returns: Json
      }
      currency_minor_units: { Args: { p_currency: string }; Returns: number }
      ensure_project_conversation: {
        Args: { p_project_id: string }
        Returns: {
          created_at: string
          id: string
          project_id: string
          public_id: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "conversations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finalize_confirmed_payment: {
        Args: { p_event_id: string }
        Returns: {
          amount_minor: number
          created_at: string
          created_by_user_id: string | null
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          organization_id: string | null
          payment_attempt_id: string | null
          payment_request_id: string | null
          provider: string | null
          provider_reference: string | null
          public_id: string
          received_at: string | null
          review_required: boolean
          source_type: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_development_test_payment: {
        Args: { p_attempt_public_id: string }
        Returns: Json
      }
      ingest_provider_event: {
        Args: {
          p_amount_minor: number
          p_currency: string
          p_event_type: string
          p_external_event_id: string
          p_ingest_key: string
          p_outcome: string
          p_provider: string
          p_provider_reference: string
        }
        Returns: Json
      }
      ingest_verified_provider_event: {
        Args: {
          p_amount_minor: number
          p_attempt_public_id: string
          p_currency: string
          p_event_type: string
          p_external_event_id: string
          p_outcome: string
          p_provider: string
          p_provider_reference: string
        }
        Returns: Json
      }
      insert_verified_assistant_ai_message: {
        Args: {
          p_body: string
          p_conversation_public_id: string
          p_suggestion: Json
        }
        Returns: {
          body: string
          conversation_id: string
          created_at: string
          created_by_user_id: string | null
          id: string
          public_id: string
          role: string
          structured_suggestion: Json | null
        }
        SetofOptions: {
          from: "*"
          to: "ai_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      insert_assistant_ai_message: {
        Args: {
          p_body: string
          p_conversation_public_id: string
          p_suggestion: Json
        }
        Returns: {
          body: string
          conversation_id: string
          created_at: string
          created_by_user_id: string | null
          id: string
          public_id: string
          role: string
          structured_suggestion: Json | null
        }
        SetofOptions: {
          from: "*"
          to: "ai_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      insert_user_ai_message: {
        Args: { p_body: string; p_conversation_public_id: string }
        Returns: {
          body: string
          conversation_id: string
          created_at: string
          created_by_user_id: string | null
          id: string
          public_id: string
          role: string
          structured_suggestion: Json | null
        }
        SetofOptions: {
          from: "*"
          to: "ai_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      internal_allocate_payment: {
        Args: {
          p_actor: string
          p_amount_minor: number
          p_invoice_id: string
          p_payment_id: string
        }
        Returns: {
          allocated_at: string
          allocated_by_user_id: string | null
          amount_minor: number
          id: string
          invoice_id: string
          payment_id: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_allocations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      internal_apply_store_order_paid: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      internal_create_notification: {
        Args: {
          p_body: string
          p_recipient: string
          p_source_public_id: string
          p_source_type: string
          p_title: string
          p_type: string
        }
        Returns: {
          body: string
          created_at: string
          id: string
          public_id: string
          read_at: string | null
          recipient_user_id: string
          source_public_id: string | null
          source_type: string | null
          title: string
          type: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      internal_enqueue_domain_event: {
        Args: {
          p_aggregate_id: string
          p_aggregate_type: string
          p_event_type: string
          p_payload: Json
        }
        Returns: {
          aggregate_id: string
          aggregate_type: string
          attempt_count: number
          event_type: string
          id: string
          last_error: string | null
          occurred_at: string
          processed_at: string | null
          processing_status: string
          safe_payload: Json
        }
        SetofOptions: {
          from: "*"
          to: "domain_outbox_events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      internal_execute_automation_action: {
        Args: {
          p_event: Database["public"]["Tables"]["domain_outbox_events"]["Row"]
          p_rule: Database["public"]["Tables"]["automation_rules"]["Row"]
        }
        Returns: undefined
      }
      internal_issue_receipt: {
        Args: { p_payment_id: string }
        Returns: {
          amount_minor: number
          created_at: string
          currency: string
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          issued_at: string
          organization_id: string | null
          payment_id: string
          public_id: string
          receipt_number: string
          snapshot: Json
        }
        SetofOptions: {
          from: "*"
          to: "receipts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      invoice_allocated_minor: {
        Args: { p_invoice_id: string }
        Returns: number
      }
      is_assigned_project_developer: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      is_organization_owner: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: never; Returns: boolean }
      is_project_customer: { Args: { p_project_id: string }; Returns: boolean }
      is_safe_https_url: { Args: { p_url: string }; Returns: boolean }
      mark_attempt_cancelled: {
        Args: { p_attempt_public_id: string; p_ingest_key: string }
        Returns: {
          amount_minor: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          ingest_key_hash: string
          payment_id: string | null
          payment_request_id: string
          provider: string
          provider_session_reference: string | null
          public_id: string
          review_reason: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_attempts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_notification_read: {
        Args: { p_public_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          public_id: string
          read_at: string | null
          recipient_user_id: string
          source_public_id: string | null
          source_type: string | null
          title: string
          type: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      normalize_upload_filename: { Args: { p_name: string }; Returns: string }
      payment_allocated_minor: {
        Args: { p_payment_id: string }
        Returns: number
      }
      payment_runtime_environment: { Args: never; Returns: string }
      post_financial_ledger_entry: {
        Args: {
          p_amount_minor: number
          p_currency: string
          p_direction: string
          p_event_type: string
          p_invoice_id: string
          p_payment_id: string
          p_receipt_id: string
          p_source_reference: string
        }
        Returns: {
          amount_minor: number
          created_at: string
          currency: string
          direction: string
          event_type: string
          id: string
          invoice_id: string | null
          occurred_at: string
          payment_id: string | null
          public_id: string
          receipt_id: string | null
          source_reference: string | null
        }
        SetofOptions: {
          from: "*"
          to: "financial_ledger_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      process_pending_outbox: { Args: never; Returns: number }
      public_ai_status: { Args: never; Returns: Json }
      public_create_guest_payment_request: {
        Args: {
          p_amount_minor: number
          p_currency: string
          p_description: string
          p_guest_email: string
          p_guest_name: string
          p_service_code: string
        }
        Returns: {
          amount_mode: string
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          description: string | null
          expires_at: string | null
          guest_email: string | null
          guest_name: string | null
          id: string
          individual_user_id: string | null
          invoice_id: string | null
          max_amount_minor: number | null
          min_amount_minor: number | null
          organization_id: string | null
          public_id: string
          requested_amount_minor: number | null
          service_code: string | null
          service_snapshot: Json
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      public_get_attempt_status: {
        Args: { p_public_id: string }
        Returns: Json
      }
      public_get_guest_receipt: {
        Args: { p_attempt_public_id: string; p_ingest_key: string }
        Returns: Json
      }
      public_get_payment_request: {
        Args: { p_public_id: string }
        Returns: Json
      }
      public_get_store_product: { Args: { p_slug: string }; Returns: Json }
      public_list_checkout_providers: { Args: never; Returns: Json }
      public_list_store_products: { Args: never; Returns: Json }
      random_grouped_public_id: { Args: { p_prefix: string }; Returns: string }
      random_public_id: { Args: { p_prefix: string }; Returns: string }
      record_project_activity: {
        Args: {
          p_event_type: string
          p_label: string
          p_project_id: string
          p_visibility: string
        }
        Returns: undefined
      }
      register_project_file: {
        Args: {
          p_claimed_mime: string
          p_original_filename: string
          p_project_id: string
          p_size_bytes: number
          p_visibility: string
        }
        Returns: {
          confirmed_at: string | null
          created_at: string
          id: string
          mime_type: string
          original_filename: string
          project_id: string
          public_id: string
          size_bytes: number
          storage_bucket: string
          storage_path: string
          uploaded_by_user_id: string
          visibility: string
        }
        SetofOptions: {
          from: "*"
          to: "project_files"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_quote: {
        Args: { p_quote_id: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          currency: string
          customer_notes: string | null
          id: string
          public_id: string
          rejected_at: string | null
          rejected_by_user_id: string | null
          sent_at: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          valid_until: string | null
          version: number
          work_request_id: string
        }
        SetofOptions: {
          from: "*"
          to: "quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_organization_member: {
        Args: { p_organization_id: string; p_user_id: string }
        Returns: undefined
      }
      replace_invoice_lines: {
        Args: { p_invoice_id: string; p_lines: Json }
        Returns: undefined
      }
      request_deliverable_changes: {
        Args: { p_deliverable_id: string; p_note: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          change_request_note: string | null
          created_at: string
          description: string | null
          file_snapshot: Json
          id: string
          project_id: string
          public_id: string
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "deliverables"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      revoke_organization_invitation: {
        Args: { p_invitation_id: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          created_by_user_id: string
          expires_at: string
          id: string
          invited_email: string
          organization_id: string
          public_id: string
          revoked_at: string | null
          role: string
          status: string
          token_hash: string
        }
        SetofOptions: {
          from: "*"
          to: "organization_invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sha256_hex: { Args: { p_value: string }; Returns: string }
      storage_project_id: { Args: { p_object_name: string }; Returns: string }
      sync_invoice_payment_state: {
        Args: { p_invoice_id: string }
        Returns: {
          amount_paid_minor: number
          billing_snapshot: Json
          contract_id: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string
          customer_snapshot: Json
          due_date: string | null
          id: string
          individual_user_id: string | null
          invoice_number: string | null
          issue_date: string | null
          issued_at: string | null
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          project_id: string | null
          public_id: string
          quote_id: string | null
          status: string
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by_user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_developer_profile: {
        Args: {
          p_availability_status: string
          p_bio: string
          p_country: string
          p_display_name: string
          p_headline: string
          p_links: Json
          p_skills: string[]
          p_timezone: string
        }
        Returns: {
          availability_status: string
          bio: string | null
          country: string | null
          created_at: string
          display_name: string
          headline: string | null
          public_id: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "developer_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
