export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      pizzeria_dough_styles: {
        Row: {
          created_at: string
          dough_style: string
          id: string
          moderator_notes: string | null
          pizzeria_id: string
          status: string | null
          user_submitted: boolean | null
          votes_down: number | null
          votes_up: number | null
        }
        Insert: {
          created_at?: string
          dough_style: string
          id?: string
          moderator_notes?: string | null
          pizzeria_id: string
          status?: string | null
          user_submitted?: boolean | null
          votes_down?: number | null
          votes_up?: number | null
        }
        Update: {
          created_at?: string
          dough_style?: string
          id?: string
          moderator_notes?: string | null
          pizzeria_id?: string
          status?: string | null
          user_submitted?: boolean | null
          votes_down?: number | null
          votes_up?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pizzeria_dough_styles_pizzeria_id_fkey"
            columns: ["pizzeria_id"]
            isOneToOne: false
            referencedRelation: "pizzerias"
            referencedColumns: ["id"]
          },
        ]
      }
      pizzeria_ratings: {
        Row: {
          created_at: string
          crust_rating: number
          id: string
          overall_rating: number
          photo_metadata: Json | null
          photos: string[] | null
          pizzeria_id: string
          review: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          crust_rating: number
          id?: string
          overall_rating: number
          photo_metadata?: Json | null
          photos?: string[] | null
          pizzeria_id: string
          review?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          crust_rating?: number
          id?: string
          overall_rating?: number
          photo_metadata?: Json | null
          photos?: string[] | null
          pizzeria_id?: string
          review?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pizzeria_ratings_pizzeria_id_fkey"
            columns: ["pizzeria_id"]
            isOneToOne: false
            referencedRelation: "pizzerias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pizzeria_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pizzerias: {
        Row: {
          address: string
          api_source: string | null
          business_type: string | null
          created_at: string
          cuisine_styles: string[] | null
          description: string | null
          hours: Json | null
          id: string
          last_updated: string | null
          latitude: number
          longitude: number
          name: string
          phone: string | null
          photos: string[] | null
          price_range: number | null
          rating_external: number | null
          review_count_external: number | null
          verified: boolean | null
          website: string | null
          yelp_id: string | null
        }
        Insert: {
          address: string
          api_source?: string | null
          business_type?: string | null
          created_at?: string
          cuisine_styles?: string[] | null
          description?: string | null
          hours?: Json | null
          id?: string
          last_updated?: string | null
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          photos?: string[] | null
          price_range?: number | null
          rating_external?: number | null
          review_count_external?: number | null
          verified?: boolean | null
          website?: string | null
          yelp_id?: string | null
        }
        Update: {
          address?: string
          api_source?: string | null
          business_type?: string | null
          created_at?: string
          cuisine_styles?: string[] | null
          description?: string | null
          hours?: Json | null
          id?: string
          last_updated?: string | null
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          photos?: string[] | null
          price_range?: number | null
          rating_external?: number | null
          review_count_external?: number | null
          verified?: boolean | null
          website?: string | null
          yelp_id?: string | null
        }
        Relationships: []
      }
      saved_pizzerias: {
        Row: {
          created_at: string
          pizzeria_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          pizzeria_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          pizzeria_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_pizzerias_pizzeria_id_fkey"
            columns: ["pizzeria_id"]
            isOneToOne: false
            referencedRelation: "pizzerias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_pizzerias_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          email: string
          full_name: string | null
          id: string
          location: string | null
          manual_address: string | null
          role: string | null
          updated_at: string
          use_manual_location: boolean | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          manual_address?: string | null
          role?: string | null
          updated_at?: string
          use_manual_location?: boolean | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          manual_address?: string | null
          role?: string | null
          updated_at?: string
          use_manual_location?: boolean | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      pizzeria_rating_summary: {
        Row: {
          avg_crust_rating: number | null
          avg_overall_rating: number | null
          five_star_count: number | null
          four_star_count: number | null
          one_star_count: number | null
          pizzeria_id: string | null
          three_star_count: number | null
          total_ratings: number | null
          two_star_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pizzeria_ratings_pizzeria_id_fkey"
            columns: ["pizzeria_id"]
            isOneToOne: false
            referencedRelation: "pizzerias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_nearby_pizzerias: {
        Args: { user_lat: number; user_lon: number; radius_km?: number }
        Returns: {
          id: string
          name: string
          address: string
          latitude: number
          longitude: number
          phone: string
          website: string
          verified: boolean
          photos: string[]
          description: string
          hours: Json
          price_range: number
          business_type: string
          cuisine_styles: string[]
          api_source: string
          yelp_id: string
          rating_external: number
          review_count_external: number
          last_updated: string
          created_at: string
          distance_km: number
        }[]
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
    Enums: {},
  },
} as const
