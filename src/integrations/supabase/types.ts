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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      company_profiles: {
        Row: {
          city: string
          company_description: string | null
          company_name: string
          company_size: Database["public"]["Enums"]["company_size"]
          cooperation_type: string[] | null
          country: string
          created_at: string | null
          founded_year: number | null
          id: string
          industry: string[]
          logo_url: string | null
          looking_for: string | null
          offers: string | null
          updated_at: string | null
          user_id: string
          verification_badge_url: string | null
          verification_status: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          city: string
          company_description?: string | null
          company_name: string
          company_size?: Database["public"]["Enums"]["company_size"]
          cooperation_type?: string[] | null
          country: string
          created_at?: string | null
          founded_year?: number | null
          id?: string
          industry: string[]
          logo_url?: string | null
          looking_for?: string | null
          offers?: string | null
          updated_at?: string | null
          user_id: string
          verification_badge_url?: string | null
          verification_status?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          city?: string
          company_description?: string | null
          company_name?: string
          company_size?: Database["public"]["Enums"]["company_size"]
          cooperation_type?: string[] | null
          country?: string
          created_at?: string | null
          founded_year?: number | null
          id?: string
          industry?: string[]
          logo_url?: string | null
          looking_for?: string | null
          offers?: string | null
          updated_at?: string | null
          user_id?: string
          verification_badge_url?: string | null
          verification_status?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      connection_requests: {
        Row: {
          created_at: string | null
          from_company_id: string
          id: string
          message: string | null
          status: string
          to_company_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_company_id: string
          id?: string
          message?: string | null
          status?: string
          to_company_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_company_id?: string
          id?: string
          message?: string | null
          status?: string
          to_company_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_from_company_id_fkey"
            columns: ["from_company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_to_company_id_fkey"
            columns: ["to_company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          company_id_1: string
          company_id_2: string
          created_at: string | null
          id: string
          match_reasons: string[] | null
          match_score: number
        }
        Insert: {
          company_id_1: string
          company_id_2: string
          created_at?: string | null
          id?: string
          match_reasons?: string[] | null
          match_score: number
        }
        Update: {
          company_id_1?: string
          company_id_2?: string
          created_at?: string | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_company_id_1_fkey"
            columns: ["company_id_1"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_company_id_2_fkey"
            columns: ["company_id_2"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          from_company_id: string
          id: string
          read: boolean | null
          to_company_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          from_company_id: string
          id?: string
          read?: boolean | null
          to_company_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          from_company_id?: string
          id?: string
          read?: boolean | null
          to_company_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_company_id_fkey"
            columns: ["from_company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_company_id_fkey"
            columns: ["to_company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          related_company_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          related_company_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          related_company_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      video_call_sessions: {
        Row: {
          company_id_1: string
          company_id_2: string
          created_at: string | null
          ended_at: string | null
          id: string
          room_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          company_id_1: string
          company_id_2: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          room_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          company_id_1?: string
          company_id_2?: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          room_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_call_sessions_company_id_1_fkey"
            columns: ["company_id_1"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_call_sessions_company_id_2_fkey"
            columns: ["company_id_2"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
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
      company_size: "1" | "2-10" | "11-50" | "51-250" | "250+"
      partnership_type:
        | "supplier"
        | "buyer"
        | "cooperation"
        | "service_provider"
        | "service_seeker"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      company_size: ["1", "2-10", "11-50", "51-250", "250+"],
      partnership_type: [
        "supplier",
        "buyer",
        "cooperation",
        "service_provider",
        "service_seeker",
      ],
    },
  },
} as const
