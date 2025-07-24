// src/utils/rating.ts
import { supabase } from "../services/supabase";
import { RecipeRating } from "../types";

export interface RatingInput {
  recipe_id: string;
  user_id: string;
  overall_rating: number; // renamed from rating
  crust_rating: number;
  review?: string;
  photos?: string[];
}

export interface RatingStats {
  average_overall_rating: number; // renamed from average_rating
  average_crust_rating: number;
  rating_count: number;
}

export const createOrUpdateRating = async (
  ratingInput: RatingInput
): Promise<{ success: boolean; error?: string; rating?: RecipeRating }> => {
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
      .from("recipe_ratings")
      .select("*")
      .eq("recipe_id", ratingInput.recipe_id)
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
        .from("recipe_ratings")
        .update({
          overall_rating: ratingInput.overall_rating,
          crust_rating: ratingInput.crust_rating,
          review: ratingInput.review,
          photos: ratingInput.photos,
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
        .from("recipe_ratings")
        .insert({
          recipe_id: ratingInput.recipe_id,
          user_id: ratingInput.user_id,
          overall_rating: ratingInput.overall_rating,
          crust_rating: ratingInput.crust_rating,
          review: ratingInput.review || null,
          photos: ratingInput.photos || null,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      
      result = data;
    }

    return { success: true, rating: result as RecipeRating };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
};

export const getRatingStats = async (
  recipe_id: string
): Promise<{ success: boolean; error?: string; stats?: RatingStats }> => {
  try {
    const { data, error } = await supabase
      .from("recipe_ratings")
      .select("overall_rating, crust_rating")
      .eq("recipe_id", recipe_id);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        stats: {
          average_overall_rating: 0,
          average_crust_rating: 0,
          rating_count: 0,
        },
      };
    }

    const rating_count = data.length;
    const average_overall_rating = 
      data.reduce((sum, item) => sum + item.overall_rating, 0) / rating_count;
    const average_crust_rating =
      data.reduce((sum, item) => sum + (item.crust_rating || 0), 0) / rating_count;

    return {
      success: true,
      stats: {
        average_overall_rating,
        average_crust_rating,
        rating_count,
      },
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
};
