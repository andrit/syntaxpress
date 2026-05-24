// ──────────────────────────────────────────────
// Database Types — Supabase Schema
// ──────────────────────────────────────────────
// In production, regenerate this with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT > src/types/database.ts
//
// This hand-written version bootstraps type safety until then.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: 'owner' | 'editor' | 'viewer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'owner' | 'editor' | 'viewer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          role?: 'owner' | 'editor' | 'viewer';
          updated_at?: string;
        };
      };
      designs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          collection: string | null;
          tags: string[];
          target_who: string[];
          target_what: string[];
          target_when: string[];
          status: 'draft' | 'staged' | 'published' | 'archived';
          source_file_path: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          collection?: string | null;
          tags?: string[];
          target_who?: string[];
          target_what?: string[];
          target_when?: string[];
          status?: 'draft' | 'staged' | 'published' | 'archived';
          source_file_path?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string | null;
          collection?: string | null;
          tags?: string[];
          target_who?: string[];
          target_what?: string[];
          target_when?: string[];
          status?: 'draft' | 'staged' | 'published' | 'archived';
          source_file_path?: string | null;
          updated_at?: string;
        };
      };
      design_exports: {
        Row: {
          id: string;
          design_id: string;
          platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
          file_path: string;
          width: number;
          height: number;
          format: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          design_id: string;
          platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
          file_path: string;
          width: number;
          height: number;
          format?: string;
          created_at?: string;
        };
        Update: {
          file_path?: string;
          width?: number;
          height?: number;
          format?: string;
        };
      };
      platform_listings: {
        Row: {
          id: string;
          design_id: string;
          platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
          title: string;
          description: string;
          tags: string[];
          status: 'draft' | 'ready' | 'published' | 'failed';
          external_id: string | null;
          external_url: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          design_id: string;
          platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
          title: string;
          description: string;
          tags?: string[];
          status?: 'draft' | 'ready' | 'published' | 'failed';
          external_id?: string | null;
          external_url?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          tags?: string[];
          status?: 'draft' | 'ready' | 'published' | 'failed';
          external_id?: string | null;
          external_url?: string | null;
          published_at?: string | null;
          updated_at?: string;
        };
      };
      runs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'planning' | 'in_progress' | 'completed' | 'archived';
          target_platforms: ('shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle')[];
          design_count: number;
          created_by: string;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: 'planning' | 'in_progress' | 'completed' | 'archived';
          target_platforms: ('shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle')[];
          design_count?: number;
          created_by: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          status?: 'planning' | 'in_progress' | 'completed' | 'archived';
          target_platforms?: ('shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle')[];
          design_count?: number;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      run_designs: {
        Row: {
          id: string;
          run_id: string;
          design_id: string;
          sort_order: number;
          current_step: 1 | 2 | 3 | 4 | 5;
          step_status: Json;
          platform_status: Json;
          notes: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          design_id: string;
          sort_order?: number;
          current_step?: 1 | 2 | 3 | 4 | 5;
          step_status?: Json;
          platform_status?: Json;
          notes?: string | null;
        };
        Update: {
          sort_order?: number;
          current_step?: 1 | 2 | 3 | 4 | 5;
          step_status?: Json;
          platform_status?: Json;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      listing_templates: {
        Row: {
          id: string;
          name: string;
          platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
          product_type: string | null;
          collection: string | null;
          is_default: boolean;
          title_template: string;
          description_template: string;
          tag_template: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
          product_type?: string | null;
          collection?: string | null;
          is_default?: boolean;
          title_template: string;
          description_template: string;
          tag_template: string;
          created_by: string;
        };
        Update: {
          name?: string;
          product_type?: string | null;
          collection?: string | null;
          is_default?: boolean;
          title_template?: string;
          description_template?: string;
          tag_template?: string;
          updated_at?: string;
        };
      };
      export_specs: {
        Row: {
          id: string;
          platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
          product_type: string;
          width: number;
          height: number;
          format: string;
          label: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
          product_type: string;
          width: number;
          height: number;
          format?: string;
          label: string;
          is_active?: boolean;
        };
        Update: {
          width?: number;
          height?: number;
          format?: string;
          label?: string;
          is_active?: boolean;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      admin_role: 'owner' | 'editor' | 'viewer';
      design_status: 'draft' | 'staged' | 'published' | 'archived';
      listing_status: 'draft' | 'ready' | 'published' | 'failed';
      platform: 'shopify' | 'etsy' | 'redbubble' | 'teepublic' | 'society6' | 'zazzle';
      run_status: 'planning' | 'in_progress' | 'completed' | 'archived';
    };
  };
}

// ──────────────────────────────────────────────
// Convenience type aliases
// ──────────────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
