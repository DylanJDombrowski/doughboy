// src/types/database.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          current_latitude: number | null;
          current_longitude: number | null;
          manual_address: string | null;
          use_manual_location: boolean;
          role: "user" | "admin" | "moderator";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          current_latitude?: number | null;
          current_longitude?: number | null;
          manual_address?: string | null;
          use_manual_location?: boolean;
          role?: "user" | "admin" | "moderator";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          current_latitude?: number | null;
          current_longitude?: number | null;
          manual_address?: string | null;
          use_manual_location?: boolean;
          role?: "user" | "admin" | "moderator";
          created_at?: string;
          updated_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          difficulty: number;
          total_time_minutes: number;
          servings: number;
          hydration_percentage: number | null;
          is_featured: boolean;
          is_public: boolean;
          photos: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          difficulty: number;
          total_time_minutes: number;
          servings: number;
          hydration_percentage?: number | null;
          is_featured?: boolean;
          is_public?: boolean;
          photos?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          difficulty?: number;
          total_time_minutes?: number;
          servings?: number;
          hydration_percentage?: number | null;
          is_featured?: boolean;
          is_public?: boolean;
          photos?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          name: string;
          amount: number;
          unit: string;
          percentage: number | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          name: string;
          amount: number;
          unit: string;
          percentage?: number | null;
          order_index: number;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          name?: string;
          amount?: number;
          unit?: string;
          percentage?: number | null;
          order_index?: number;
        };
      };
      process_steps: {
        Row: {
          id: string;
          recipe_id: string;
          step_number: number;
          title: string;
          description: string | null;
          duration_minutes: number | null;
          temperature: number | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          step_number: number;
          title: string;
          description?: string | null;
          duration_minutes?: number | null;
          temperature?: number | null;
          order_index: number;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          step_number?: number;
          title?: string;
          description?: string | null;
          duration_minutes?: number | null;
          temperature?: number | null;
          order_index?: number;
        };
      };
      recipe_ratings: {
        Row: {
          id: string;
          recipe_id: string;
          user_id: string;
          rating: number;
          review: string | null;
          photos: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          user_id: string;
          rating: number;
          review?: string | null;
          photos?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          user_id?: string;
          rating?: number;
          review?: string | null;
          photos?: string[] | null;
          created_at?: string;
        };
      };
      pizzerias: {
        Row: {
          id: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          phone: string | null;
          website: string | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          phone?: string | null;
          website?: string | null;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          phone?: string | null;
          website?: string | null;
          verified?: boolean;
          created_at?: string;
        };
      };
      pizzeria_dough_styles: {
        Row: {
          id: string;
          pizzeria_id: string;
          dough_style: string;
          user_submitted: boolean;
          votes_up: number;
          votes_down: number;
          status: "pending" | "approved" | "rejected";
          moderator_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pizzeria_id: string;
          dough_style: string;
          user_submitted?: boolean;
          votes_up?: number;
          votes_down?: number;
          status?: "pending" | "approved" | "rejected";
          moderator_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pizzeria_id?: string;
          dough_style?: string;
          user_submitted?: boolean;
          votes_up?: number;
          votes_down?: number;
          status?: "pending" | "approved" | "rejected";
          moderator_notes?: string | null;
          created_at?: string;
        };
      };
      saved_recipes: {
        Row: {
          user_id: string;
          recipe_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          recipe_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          recipe_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
