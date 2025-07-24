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
      ingredients: {
        Row: {
          amount: number
          id: string
          name: string
          order_index: number
          percentage: number | null
          recipe_id: string
          unit: string
        }
        Insert: {
          amount: number
          id?: string
          name: string
          order_index: number
          percentage?: number | null
          recipe_id: string
          unit: string
        }
        Update: {
          amount?: number
          id?: string
          name?: string
          order_index?: number
          percentage?: number | null
          recipe_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
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
          created_at: string
          description: string | null
          hours: Json | null
          id: string
          latitude: number
          longitude: number
          name: string
          phone: string | null
          photos: string[] | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          hours?: Json | null
          id?: string
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          photos?: string[] | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          hours?: Json | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          photos?: string[] | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      process_steps: {
        Row: {
          description: string | null
          duration_minutes: number | null
          id: string
          order_index: number
          recipe_id: string
          step_number: number
          temperature: number | null
          title: string
        }
        Insert: {
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index: number
          recipe_id: string
          step_number: number
          temperature?: number | null
          title: string
        }
        Update: {
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          recipe_id?: string
          step_number?: number
          temperature?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ratings: {
        Row: {
          created_at: string
          crust_rating: number | null
          id: string
          overall_rating: number
          photos: string[] | null
          recipe_id: string
          review: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          crust_rating?: number | null
          id?: string
          overall_rating: number
          photos?: string[] | null
          recipe_id: string
          review?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          crust_rating?: number | null
          id?: string
          overall_rating?: number
          photos?: string[] | null
          recipe_id?: string
          review?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ratings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: number
          hydration_percentage: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          photos: string[] | null
          servings: number
          title: string
          total_time_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty: number
          hydration_percentage?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          photos?: string[] | null
          servings: number
          title: string
          total_time_minutes: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: number
          hydration_percentage?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          photos?: string[] | null
          servings?: number
          title?: string
          total_time_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      saved_recipes: {
        Row: {
          created_at: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_recipes_user_id_fkey"
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
