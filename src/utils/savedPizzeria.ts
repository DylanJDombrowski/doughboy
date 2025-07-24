// src/utils/savedPizzeria.ts
import { supabase } from "../services/supabase";
import { SavedPizzeria, Pizzeria } from "../types";

/**
 * Save a pizzeria to a user's favorites
 * @param userId The ID of the user
 * @param pizzeriaId The ID of the pizzeria to save
 * @returns Success status and error message if any
 */
export const savePizzeria = async (
  userId: string,
  pizzeriaId: string
): Promise<{ success: boolean; error?: string; savedPizzeria?: SavedPizzeria }> => {
  try {
    // Check if already saved
    const { data: existing, error: checkError } = await supabase
      .from("saved_pizzerias")
      .select("*")
      .eq("user_id", userId)
      .eq("pizzeria_id", pizzeriaId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existing) {
      return { success: true, savedPizzeria: existing as SavedPizzeria };
    }

    // Save the pizzeria
    const { data, error } = await supabase
      .from("saved_pizzerias")
      .insert({
        user_id: userId,
        pizzeria_id: pizzeriaId
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { 
      success: true,
      savedPizzeria: data as SavedPizzeria
    };
  } catch (error) {
    console.error("Error saving pizzeria:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * Unsave (remove) a pizzeria from a user's favorites
 * @param userId The ID of the user
 * @param pizzeriaId The ID of the pizzeria to unsave
 * @returns Success status and error message if any
 */
export const unsavePizzeria = async (
  userId: string,
  pizzeriaId: string
): Promise<{ success: boolean; error?: string }> => {
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
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * Check if a pizzeria is saved by a user
 * @param userId The ID of the user
 * @param pizzeriaId The ID of the pizzeria
 * @returns Whether the pizzeria is saved
 */
export const isPizzeriaSaved = async (
  userId: string,
  pizzeriaId: string
): Promise<{ isSaved: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("saved_pizzerias")
      .select("id")
      .eq("user_id", userId)
      .eq("pizzeria_id", pizzeriaId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return { isSaved: !!data };
  } catch (error) {
    console.error("Error checking saved status:", error);
    return { 
      isSaved: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

/**
 * Get all pizzerias saved by a user
 * @param userId The ID of the user
 * @returns The saved pizzerias
 */
export const getSavedPizzerias = async (
  userId: string
): Promise<{ success: boolean; pizzerias?: Pizzeria[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("saved_pizzerias")
      .select(`
        pizzeria_id,
        pizzerias (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Extract pizzerias from the joined data
    const pizzerias = data.map(item => item.pizzerias as unknown as Pizzeria);

    return { 
      success: true,
      pizzerias
    };
  } catch (error) {
    console.error("Error getting saved pizzerias:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};
