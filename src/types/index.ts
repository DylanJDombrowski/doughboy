// src/types/index.ts
export * from "./database";

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: DoughCategory;
  difficulty: number;
  total_time_minutes: number;
  servings: number;
  hydration_percentage?: number;
  is_featured: boolean;
  is_public: boolean;
  photos?: string[];
  ingredients: Ingredient[];
  process_steps: ProcessStep[];
  ratings?: RecipeRating[];
  average_overall_rating?: number; // renamed from average_rating
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
  percentage?: number;
  order_index: number;
}

export interface ProcessStep {
  id: string;
  recipe_id: string;
  step_number: number;
  title: string;
  description?: string;
  duration_minutes?: number;
  temperature?: number;
  order_index: number;
}

export interface RecipeRating {
  id: string;
  recipe_id: string;
  user_id: string;
  overall_rating: number; // renamed from rating
  crust_rating: number;
  review?: string;
  photos?: string[];
  created_at: string;
}

export interface Pizzeria {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  verified: boolean;
  dough_styles: PizzeriaDoughStyle[];
  pizzeria_dough_styles?: PizzeriaDoughStyle[];
  average_overall_rating?: number; // renamed from average_rating
  average_crust_rating?: number;
  rating_count?: number;
  created_at: string;
}

export interface PizzeriaDoughStyle {
  id: string;
  pizzeria_id: string;
  dough_style: DoughCategory;
  user_submitted: boolean;
  votes_up: number;
  votes_down: number;
  status: "pending" | "approved" | "rejected";
  moderator_notes?: string;
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
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  current_latitude?: number;
  current_longitude?: number;
  manual_address?: string;
  use_manual_location: boolean;
  role: "user" | "admin" | "moderator";
  created_at: string;
  updated_at: string;
}
