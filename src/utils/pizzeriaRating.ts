// src/utils/pizzeriaRating.ts
import { supabase } from "../services/supabase";
import { PizzeriaRating } from "../types";

export interface PizzeriaRatingInput {
  pizzeria_id: string;
  user_id: string;
  overall_rating: number;
  crust_rating: number;
  review?: string;
  photos?: string[];
}

export interface PizzeriaRatingStats {
  average_overall_rating: number;
  average_crust_rating: number;
  rating_count: number;
}

/**
 * Create or update a pizzeria rating
 * @param ratingInput Rating data to create or update
 * @returns Success status, error message if any, and the rating object
 */
export const createOrUpdatePizzeriaRating = async (
  ratingInput: PizzeriaRatingInput
): Promise<{ success: boolean; error?: string; rating?: PizzeriaRating }> => {
  try {
    // Validate inputs
    if (ratingInput.overall_rating < 1 || ratingInput.overall_rating > 5) {
      return { success: false, error: "Overall rating must be between 1 and 5" };
    }
    
    if (ratingInput.crust_rating < 1 || ratingInput.crust_rating > 5) {
      return { success: false, error: "Crust rating must be between 1 and 5" };
    }

    // Check if rating already exists
    const { data: existingRatings, error: fetchError } = await supabase
      .from("pizzeria_ratings")
      .select("*")
      .eq("pizzeria_id", ratingInput.pizzeria_id)
      .eq("user_id", ratingInput.user_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is the error for no rows returned
      return { success: false, error: fetchError.message };
    }

    let result;
    
    if (existingRatings) {
      // Update existing rating
      const { data, error } = await supabase
        .from("pizzeria_ratings")
        .update({
          overall_rating: ratingInput.overall_rating,
          crust_rating: ratingInput.crust_rating,
          review: ratingInput.review,
          photos: ratingInput.photos,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingRatings.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      
      result = data;
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from("pizzeria_ratings")
        .insert({
          pizzeria_id: ratingInput.pizzeria_id,
          user_id: ratingInput.user_id,
          overall_rating: ratingInput.overall_rating,
          crust_rating: ratingInput.crust_rating,
          review: ratingInput.review,
          photos: ratingInput.photos
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      
      result = data;
    }

    return { 
      success: true, 
      rating: result as PizzeriaRating 
    };
  } catch (error) {
    console.error("Error creating/updating pizzeria rating:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * Get rating statistics for a pizzeria
 * @param pizzeriaId The ID of the pizzeria
 * @returns Rating statistics including averages and count
 */
export const getPizzeriaRatingStats = async (
  pizzeriaId: string
): Promise<{ success: boolean; stats?: PizzeriaRatingStats; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("pizzeria_ratings")
      .select("overall_rating, crust_rating")
      .eq("pizzeria_id", pizzeriaId);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return { 
        success: true, 
        stats: {
          average_overall_rating: 0,
          average_crust_rating: 0,
          rating_count: 0
        }
      };
    }

    // Calculate average ratings
    const overall_ratings = data.map(r => r.overall_rating);
    const crust_ratings = data.map(r => r.crust_rating);
    
    const average_overall_rating = 
      overall_ratings.reduce((a, b) => a + b, 0) / overall_ratings.length;
    
    const average_crust_rating = 
      crust_ratings.reduce((a, b) => a + b, 0) / crust_ratings.length;

    return {
      success: true,
      stats: {
        average_overall_rating,
        average_crust_rating,
        rating_count: data.length
      }
    };
  } catch (error) {
    console.error("Error getting pizzeria rating stats:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * Get a user's rating for a pizzeria
 * @param pizzeriaId The ID of the pizzeria
 * @param userId The ID of the user
 * @returns The user's rating or null if not found
 */
export const getUserPizzeriaRating = async (
  pizzeriaId: string,
  userId: string
): Promise<{ success: boolean; rating?: PizzeriaRating; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("pizzeria_ratings")
      .select("*")
      .eq("pizzeria_id", pizzeriaId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") { // No rows returned
        return { success: true, rating: undefined };
      }
      throw error;
    }

    return {
      success: true,
      rating: data as PizzeriaRating
    };
  } catch (error) {
    console.error("Error getting user pizzeria rating:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * Delete a user's rating for a pizzeria
 * @param ratingId The ID of the rating to delete
 * @param userId The ID of the user (for authorization)
 * @returns Success status and error message if any
 */
export const deletePizzeriaRating = async (
  ratingId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if the rating belongs to the user
    const { data: rating, error: fetchError } = await supabase
      .from("pizzeria_ratings")
      .select("user_id")
      .eq("id", ratingId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!rating) {
      return { success: false, error: "Rating not found" };
    }

    if (rating.user_id !== userId) {
      return { success: false, error: "Not authorized to delete this rating" };
    }

    // Delete the rating
    const { error } = await supabase
      .from("pizzeria_ratings")
      .delete()
      .eq("id", ratingId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting pizzeria rating:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};
