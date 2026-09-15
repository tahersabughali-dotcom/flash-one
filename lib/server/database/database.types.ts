/**
 * Generated from the non-production Supabase schema.
 * Do not hand-edit. Regenerate after schema changes.
 */
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
      developer_profiles: {
        Row: {
          availability_status: string
          bio: string | null
          created_at: string
          display_name: string
          headline: string | null
          public_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_status?: string
          bio?: string | null
          created_at?: string
          display_name: string
          headline?: string | null
          public_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_status?: string
          bio?: string | null
          created_at?: string
          display_name?: string
          headline?: string | null
          public_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      individual_accounts: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
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
          created_at: string
          id: string
          name: string
          public_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          public_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          public_id?: string
          updated_at?: string
        }
        Relationships: []
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
      accept_quote: { Args: { p_quote_id: string }; Returns: Json }
      actor_is_request_customer: {
        Args: {
          p_actor: string
          p_request: Database["public"]["Tables"]["work_requests"]["Row"]
        }
        Returns: boolean
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
      assert_platform_admin: { Args: never; Returns: string }
      can_access_project: { Args: { p_project_id: string }; Returns: boolean }
      can_access_work_request: {
        Args: { p_request_id: string }
        Returns: boolean
      }
      canonical_upload_mime: { Args: { p_filename: string }; Returns: string }
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
      create_organization: {
        Args: { p_name: string }
        Returns: {
          created_at: string
          id: string
          name: string
          public_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
      is_platform_admin: { Args: never; Returns: boolean }
      is_project_customer: { Args: { p_project_id: string }; Returns: boolean }
      normalize_upload_filename: { Args: { p_name: string }; Returns: string }
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
      storage_project_id: { Args: { p_object_name: string }; Returns: string }
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
