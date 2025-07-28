// src/types/index.ts - Updated for Pizza Review Platform
import { Database } from "./database";
export * from "./database";

export interface Pizzeria {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  website?: string | null;
  verified: boolean | null;
  photos?: string[] | null;
  description?: string | null;
  hours?: any | null;
  // New enhanced fields - matching database exactly
  price_range?: number | null; // 1-4 for $-$$
  business_type?: string | null; // Database stores as string, we'll validate in app
  cuisine_styles?: string[] | null;
  api_source?: string | null; // Database stores as string
  yelp_id?: string | null;
  rating_external?: number | null;
  review_count_external?: number | null;
  last_updated?: string | null;
  // Relations
  dough_styles?: PizzeriaDoughStyle[];
  pizzeria_dough_styles?: PizzeriaDoughStyle[];
  average_overall_rating?: number;
  average_crust_rating?: number;
  rating_count?: number;
  total_ratings?: number;
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
  review?: string | null;
  photos?: string[] | null;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
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

// Helper types for validation
export type BusinessType = "chain" | "independent" | "franchise";
export type ApiSource =
  | "yelp"
  | "user_submitted"
  | "foursquare"
  | "google"
  | "openstreetmap";

// Type guards for validation
export const isValidBusinessType = (
  type: string | null
): type is BusinessType => {
  return type !== null && ["chain", "independent", "franchise"].includes(type);
};

export const isValidApiSource = (
  source: string | null
): source is ApiSource => {
  return (
    source !== null &&
    [
      "yelp",
      "user_submitted",
      "foursquare",
      "google",
      "openstreetmap",
    ].includes(source)
  );
};
export type PizzeriaWithDistance = Pizzeria & {
  distance: number;
  dough_styles?: PizzeriaDoughStyle[];
};

export type PizzeriaInsert =
  Database["public"]["Tables"]["pizzerias"]["Insert"];
export type PizzeriaRatingInsert =
  Database["public"]["Tables"]["pizzeria_ratings"]["Insert"];

// Yelp API Response Types
export interface YelpBusiness {
  id: string;
  name: string;
  url: string;
  phone: string;
  display_phone: string;
  image_url: string;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  rating: number;
  review_count: number;
  location: {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  price?: string; // "$", "$$", "$$$", "$$$$"
  photos: string[];
  hours?: Array<{
    open: Array<{
      is_overnight: boolean;
      start: string;
      end: string;
      day: number;
    }>;
    hours_type: string;
    is_open_now: boolean;
  }>;
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: {
      longitude: number;
      latitude: number;
    };
  };
}

// Pizza Passport / User Stats
export interface UserStats {
  total_reviews: number;
  total_pizzerias_visited: number;
  average_rating_given: number;
  favorite_pizza_style: string;
  recent_reviews: PizzeriaRating[];
  badges: UserBadge[];
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}
