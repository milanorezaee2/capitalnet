// ─── Supabase Database Types ──────────────────────────────────────────────────
// این فایل با ساختار واقعی DB هماهنگ شده است
// برای به‌روزرسانی خودکار: npx supabase gen types typescript --project-id qfslyvnfnfatqzmchsqx

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          company_name: string | null;
          position: string | null;
          industry: string | null;
          website: string | null;
          message: string | null;
          password_hash: string | null;
          role_id: string | null;
          created_at: string;
          auth_email: string | null;
          last_login_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'> & { created_at?: string };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };

      admins: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          role_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admins']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['admins']['Row']>;
      };

      roles: {
        Row: { id: string; name: string; description: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['roles']['Row']>;
      };

      // جدول اصلی فرم ارزیابی (کد از alias 'leads' استفاده می‌کند)
      assessments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          profile_type: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          linkedin: string | null;
          company_name: string | null;
          sector: string | null;
          stage: string | null;
          capital_required: string | null;
          one_liner: string | null;
          org_name: string | null;
          ticket_size: string | null;
          stage_pref: string | null;
          geo_pref: string | null;
          confidence: string | null;
          message: string | null;
          confirm_accuracy: boolean;
          deck_file: string | null;
          deck_url: string | null;
          reviewed: boolean;
          notes: string;
          status: string;
          admin_notes: string | null;
        };
        Insert: Partial<Database['public']['Tables']['assessments']['Row']>;
        Update: Partial<Database['public']['Tables']['assessments']['Row']>;
      };

      contact_messages: {
        Row: {
          id: string;
          created_at: string;
          full_name: string;
          email: string | null;
          subject: string | null;
          message: string;
          read: boolean;
          status: string;
          admin_reply: string | null;
          replied_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['contact_messages']['Row']>;
        Update: Partial<Database['public']['Tables']['contact_messages']['Row']>;
      };

      blog_posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          slug: string | null;
          title: string;
          excerpt: string;
          content: string;
          cover_image: string | null;
          tags: string[] | null;
          category: string | null;
          status: string;
          author_name: string;
          author_role: string;
          published_at: string | null;
          read_time: string;
          featured: boolean;
          views: number;
          likes: number;
        };
        Insert: Partial<Database['public']['Tables']['blog_posts']['Row']>;
        Update: Partial<Database['public']['Tables']['blog_posts']['Row']>;
      };

      site_settings: {
        Row: { id: string; key: string; value: Json; updated_at: string };
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>;
      };

      testimonials: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          role: string;
          company: string | null;
          text: string;
          avatar_url: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: Partial<Database['public']['Tables']['testimonials']['Row']>;
        Update: Partial<Database['public']['Tables']['testimonials']['Row']>;
      };

      page_views: {
        Row: {
          id: string;
          created_at: string;
          page: string;
          session_id: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: Partial<Database['public']['Tables']['page_views']['Row']>;
        Update: Partial<Database['public']['Tables']['page_views']['Row']>;
      };

      notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: string;
          user_id: string | null;
          is_read: boolean;
          created_at: string;
          actor_ref: string | null;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };

      chat_rooms: {
        Row: {
          id: string;
          user_id: string | null;
          admin_id: string | null;
          status: string;
          created_at: string;
          session_id: string | null;
          guest_name: string | null;
        };
        Insert: Partial<Database['public']['Tables']['chat_rooms']['Row']>;
        Update: Partial<Database['public']['Tables']['chat_rooms']['Row']>;
      };

      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          sender_type: string;
          message: string;
          attachment: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['chat_messages']['Row']>;
        Update: Partial<Database['public']['Tables']['chat_messages']['Row']>;
      };

      founder_submissions: {
        Row: {
          id: string;
          created_at: string;
          profile_type: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          linkedin: string | null;
          company_name: string | null;
          sector: string | null;
          stage: string | null;
          capital_required: string | null;
          one_liner: string | null;
          org_name: string | null;
          ticket_size: string | null;
          stage_pref: string | null;
          geo_pref: string | null;
          confidence: string | null;
          message: string | null;
          confirm_accuracy: boolean;
          deck_file: string | null;
          reviewed: boolean;
        };
        Insert: Partial<Database['public']['Tables']['founder_submissions']['Row']>;
        Update: Partial<Database['public']['Tables']['founder_submissions']['Row']>;
      };

      site_content: {
        Row: { id: string; content: Json; updated_at: string };
        Insert: Partial<Database['public']['Tables']['site_content']['Row']>;
        Update: Partial<Database['public']['Tables']['site_content']['Row']>;
      };

      push_tokens: {
        Row: {
          id: string;
          token: string;
          platform: string | null;
          created_at: string;
          user_id: string | null;
          admin_id: string | null;
        };
        Insert: Partial<Database['public']['Tables']['push_tokens']['Row']>;
        Update: Partial<Database['public']['Tables']['push_tokens']['Row']>;
      };

      audit_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          resource: string;
          resource_id: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_logs']['Row']>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
