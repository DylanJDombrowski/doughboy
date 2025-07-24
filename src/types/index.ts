// src/types/index.ts - Final complete fix
import { Database } from "./database";
export * from "./database";

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category: DoughCategory;
  difficulty: number;
  total_time_minutes: number;
  servings: number;
  hydration_percentage?: number | null;
  is_featured: boolean;
  is_public: boolean;
  photos?: string[] | null;
  ingredients?: Ingredient[];
  process_steps?: ProcessStep[];
  ratings?: RecipeRating[];
  average_overall_rating?: number;
  average_crust_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  amount: number;
  unit: string;
  percentage?: number | null;
  order_index: number;
}

export interface ProcessStep {
  id: string;
  recipe_id: string;
  step_number: number;
  title: string;
  description?: string | null;
  duration_minutes?: number | null;
  temperature?: number | null;
  order_index: number;
}

export interface RecipeRating {
  id: string;
  recipe_id: string;
  user_id: string;
  overall_rating: number;
  crust_rating: number;
  review?: string | null;
  photos?: string[] | null;
  created_at: string;
}

export interface Pizzeria {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  website?: string | null;
  verified: boolean | null; // Allow null from database
  photos?: string[] | null;
  description?: string | null;
  hours?: any | null;
  dough_styles?: PizzeriaDoughStyle[];
  pizzeria_dough_styles?: PizzeriaDoughStyle[];
  average_overall_rating?: number;
  average_crust_rating?: number;
  rating_count?: number;
  created_at: string;
}

export interface PizzeriaDoughStyle {
  id: string;
  pizzeria_id: string;
  dough_style: DoughCategory;
  user_submitted: boolean | null;
  votes_up: number | null;
  votes_down: number | null;
  status: string | null;
  moderator_notes?: string | null;
  created_at: string;
}

export type DoughCategory =
  | "neapolitan"
  | "ny_style"
  | "chicago_deep_dish"
  | "sicilian"
  | "focaccia"
  | "sourdough"
  | "detroit_style"
  | "pan_pizza"
  | "thin_crust"
  | "whole_wheat"
  | "gluten_free";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  manual_address?: string | null;
  use_manual_location: boolean;
  role: "user" | "admin" | "moderator";
  created_at: string;
  updated_at: string;
}

export interface PizzeriaRating {
  id: string;
  pizzeria_id: string;
  user_id: string;
  overall_rating: number;
  crust_rating: number;
  review?: string | null; // Allow null from database
  photos?: string[] | null;
  created_at: string;
  user?: User;
}

export interface PizzeriaWithRatings extends Pizzeria {
  pizzeria_ratings?: PizzeriaRating[];
  average_overall_rating?: number;
  average_crust_rating?: number;
  total_ratings?: number;
}

export interface SavedPizzeria {
  user_id: string;
  pizzeria_id: string;
  created_at: string;
}

// Helper types for common patterns
export type PizzeriaWithDistance = Pizzeria & {
  distance: number;
  dough_styles?: PizzeriaDoughStyle[];
};

export type PizzeriaInsert =
  Database["public"]["Tables"]["pizzerias"]["Insert"];
export type PizzeriaRatingInsert =
  Database["public"]["Tables"]["pizzeria_ratings"]["Insert"];
