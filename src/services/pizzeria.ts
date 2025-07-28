// src/services/pizzeria.ts - Updated to handle missing ratings gracefully
import { supabase } from "./supabase";
import {
  Pizzeria,
  PizzeriaRating,
  PizzeriaWithRatings,
  PizzeriaDoughStyle,
  DoughCategory,
} from "../types";

/**
 * Fetch details for a pizzeria with its ratings and dough styles
 * @param id The pizzeria ID to fetch
 * @returns The pizzeria details with ratings and dough styles
 */
export const fetchPizzeriaDetails = async (
  id: string
): Promise<{
  success: boolean;
  error?: string;
  pizzeria?: PizzeriaWithRatings;
  doughStyles?: PizzeriaDoughStyle[];
  ratingStats?: {
    total_ratings: number;
    avg_overall_rating: number;
    avg_crust_rating: number;
    five_star_count: number;
    four_star_count: number;
    three_star_count: number;
    two_star_count: number;
    one_star_count: number;
  };
}> => {
  try {
    // First, get the basic pizzeria data
    const { data: pizzeria, error: pizzeriaError } = await supabase
      .from("pizzerias")
      .select("*")
      .eq("id", id)
      .single();

    if (pizzeriaError) {
      throw pizzeriaError;
    }

    if (!pizzeria) {
      return {
        success: false,
        error: "Pizzeria not found",
      };
    }

    // Get approved dough styles for this pizzeria
    const { data: doughStyles, error: doughStylesError } = await supabase
      .from("pizzeria_dough_styles")
      .select("*")
      .eq("pizzeria_id", id)
      .eq("status", "approved");

    if (doughStylesError) {
      console.warn("Error fetching dough styles:", doughStylesError);
    }

    // Transform dough styles to match our type
    const transformedDoughStyles: PizzeriaDoughStyle[] = (
      doughStyles || []
    ).map((style) => ({
      ...style,
      dough_style: style.dough_style as DoughCategory,
    }));

    // Try to get rating summary from the view
    let ratingStats = {
      total_ratings: 0,
      avg_overall_rating: 0,
      avg_crust_rating: 0,
      five_star_count: 0,
      four_star_count: 0,
      three_star_count: 0,
      two_star_count: 0,
      one_star_count: 0,
    };

    try {
      const { data: ratingSummary, error: ratingError } = await supabase
        .from("pizzeria_rating_summary")
        .select("*")
        .eq("pizzeria_id", id)
        .single();

      if (!ratingError && ratingSummary) {
        ratingStats = {
          total_ratings: ratingSummary.total_ratings || 0,
          avg_overall_rating: ratingSummary.avg_overall_rating || 0,
          avg_crust_rating: ratingSummary.avg_crust_rating || 0,
          five_star_count: ratingSummary.five_star_count || 0,
          four_star_count: ratingSummary.four_star_count || 0,
          three_star_count: ratingSummary.three_star_count || 0,
          two_star_count: ratingSummary.two_star_count || 0,
          one_star_count: ratingSummary.one_star_count || 0,
        };
      }
    } catch (ratingError) {
      console.warn(
        "Rating summary not available, using defaults:",
        ratingError
      );
      // We'll use the default values initialized above
    }

    // Format the pizzeria with its ratings
    const pizzeriaWithRatings: PizzeriaWithRatings = {
      ...pizzeria,
      pizzeria_dough_styles: transformedDoughStyles,
      dough_styles: transformedDoughStyles,
      average_overall_rating: ratingStats.avg_overall_rating,
      average_crust_rating: ratingStats.avg_crust_rating,
      total_ratings: ratingStats.total_ratings,
      rating_count: ratingStats.total_ratings,
    };

    return {
      success: true,
      pizzeria: pizzeriaWithRatings,
      doughStyles: transformedDoughStyles,
      ratingStats,
    };
  } catch (error) {
    console.error("Error fetching pizzeria details:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Fetch recent reviews for a pizzeria
 * @param pizzeriaId The pizzeria ID to fetch reviews for
 * @param limit Number of reviews to fetch (default: 5)
 * @returns Recent reviews with user information
 */
export const fetchPizzeriaReviews = async (
  pizzeriaId: string,
  limit: number = 5
): Promise<{
  success: boolean;
  error?: string;
  reviews?: PizzeriaRating[];
}> => {
  try {
    const { data, error } = await supabase
      .from("pizzeria_ratings")
      .select(
        `
        *,
        user:user_id(id, username, avatar_url, full_name)
      `
      )
      .eq("pizzeria_id", pizzeriaId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return { success: true, reviews: (data as PizzeriaRating[]) || [] };
  } catch (error) {
    console.error("Error fetching pizzeria reviews:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Check if a pizzeria is saved by the user
 * @param userId The user ID
 * @param pizzeriaId The pizzeria ID
 * @returns Whether the pizzeria is saved by the user
 */
export const isPizzeriaSaved = async (
  userId: string,
  pizzeriaId: string
): Promise<{
  success: boolean;
  error?: string;
  isSaved?: boolean;
}> => {
  try {
    const { data, error } = await supabase
      .from("saved_pizzerias")
      .select("pizzeria_id")
      .eq("user_id", userId)
      .eq("pizzeria_id", pizzeriaId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return { success: true, isSaved: !!data };
  } catch (error) {
    console.error("Error checking if pizzeria is saved:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Save a pizzeria for a user
 * @param userId The user ID
 * @param pizzeriaId The pizzeria ID to save
 * @returns Success status
 */
export const savePizzeria = async (
  userId: string,
  pizzeriaId: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Check if already saved
    const { data: existing, error: checkError } = await supabase
      .from("saved_pizzerias")
      .select("*")
      .eq("user_id", userId)
      .eq("pizzeria_id", pizzeriaId)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    // If already saved, return success
    if (existing) {
      return { success: true };
    }

    // Save the pizzeria
    const { error } = await supabase.from("saved_pizzerias").insert({
      user_id: userId,
      pizzeria_id: pizzeriaId,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving pizzeria:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Unsave a pizzeria for a user
 * @param userId The user ID
 * @param pizzeriaId The pizzeria ID to unsave
 * @returns Success status
 */
export const unsavePizzeria = async (
  userId: string,
  pizzeriaId: string
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from("saved_pizzerias")
      .delete()
      .eq("user_id", userId)
      .eq("pizzeria_id", pizzeriaId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error unsaving pizzeria:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};
