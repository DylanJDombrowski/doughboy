// src/services/achievementService.ts
import { supabase } from "./supabase";
import {
  UserAchievement,
  AchievementType,
  AchievementProgress,
} from "../types";
import { ACHIEVEMENTS, getAllAchievements } from "../constants/achievements";

/**
 * Get all achievements for a user with their progress
 */
export const getUserAchievements = async (userId: string) => {
  try {
    // Get user's earned achievements
    const { data: earnedAchievements, error: achievementError } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId);

    if (achievementError) {
      throw achievementError;
    }

    // Get all possible achievements and calculate progress
    const allAchievements = getAllAchievements();
    const achievementProgress: AchievementProgress[] = [];

    for (const achievement of allAchievements) {
      const earned =
        earnedAchievements &&
        earnedAchievements.find(
          (ea: any) => ea.achievement_type === achievement.type
        );
      const progress = await calculateAchievementProgress(
        userId,
        achievement.type
      );

      achievementProgress.push({
        achievement_type: achievement.type,
        is_earned: !!earned,
        current_progress: progress,
        target: achievement.criteria.target,
        earned_at: earned ? earned.earned_at : undefined,
      });
    }

    return {
      success: true,
      achievements: achievementProgress,
    };
  } catch (error) {
    console.error("Error getting user achievements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Calculate current progress for a specific achievement
 */
export const calculateAchievementProgress = async (
  userId: string,
  achievementType: AchievementType
) => {
  try {
    switch (achievementType) {
      case "first_review":
      case "five_reviews": {
        // Count total reviews
        const { count } = await supabase
          .from("pizzeria_ratings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);
        return count || 0;
      }

      case "ten_places": {
        // Count unique pizzerias reviewed
        const { data } = await supabase
          .from("pizzeria_ratings")
          .select("pizzeria_id")
          .eq("user_id", userId);

        const pizzeriaIds = data ? data.map((r: any) => r.pizzeria_id) : [];
        const uniquePizzerias: string[] = [];
        for (const id of pizzeriaIds) {
          if (uniquePizzerias.indexOf(id) === -1) {
            uniquePizzerias.push(id);
          }
        }
        return uniquePizzerias.length;
      }

      case "photo_reviewer": {
        // Count reviews with photos
        const { count } = await supabase
          .from("pizzeria_ratings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("photos", "is", null)
          .neq("photos", "{}");
        return count || 0;
      }

      case "style_explorer": {
        // Count unique pizza styles from reviewed pizzerias
        const { data: ratings } = await supabase
          .from("pizzeria_ratings")
          .select("pizzeria_id")
          .eq("user_id", userId);

        if (!ratings || ratings.length === 0) return 0;

        const pizzeriaIds = ratings.map((r: any) => r.pizzeria_id);
        const { data: styles } = await supabase
          .from("pizzeria_dough_styles")
          .select("dough_style")
          .in("pizzeria_id", pizzeriaIds)
          .eq("status", "approved");

        const doughStyles = styles ? styles.map((s: any) => s.dough_style) : [];
        const uniqueStyles: string[] = [];
        for (const style of doughStyles) {
          if (uniqueStyles.indexOf(style) === -1) {
            uniqueStyles.push(style);
          }
        }
        return uniqueStyles.length;
      }

      case "local_expert": {
        // This would require geolocation calculations
        // For now, return the count of all reviews (simplified)
        const { count } = await supabase
          .from("pizzeria_ratings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);
        return count || 0;
      }

      case "consistent_reviewer": {
        // Check for consecutive days with reviews
        const { data: ratings } = await supabase
          .from("pizzeria_ratings")
          .select("created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!ratings || ratings.length === 0) return 0;

        // Group ratings by date and find longest consecutive streak
        const ratingDates = ratings.map((r: any) =>
          new Date(r.created_at).toDateString()
        );
        const uniqueDates: string[] = [];
        for (const date of ratingDates) {
          if (uniqueDates.indexOf(date) === -1) {
            uniqueDates.push(date);
          }
        }
        uniqueDates.sort();

        let maxStreak = 0;
        let currentStreak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i - 1]);
          const currDate = new Date(uniqueDates[i]);
          const diffDays = Math.abs(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        }

        return Math.max(maxStreak, currentStreak);
      }

      default:
        return 0;
    }
  } catch (error) {
    console.error(`Error calculating progress for ${achievementType}:`, error);
    return 0;
  }
};

/**
 * Check and award achievements for a user
 */
export const checkAndAwardAchievements = async (userId: string) => {
  try {
    const { data: existingAchievements } = await supabase
      .from("user_achievements")
      .select("achievement_type")
      .eq("user_id", userId);

    const existingTypes = existingAchievements
      ? existingAchievements.map((a: any) => a.achievement_type)
      : [];
    const newAchievements: AchievementType[] = [];

    // Check each achievement type
    for (const achievement of getAllAchievements()) {
      if (existingTypes.indexOf(achievement.type) !== -1) {
        continue; // Already earned
      }

      const progress = await calculateAchievementProgress(
        userId,
        achievement.type
      );

      if (progress >= achievement.criteria.target) {
        // Award the achievement
        const { error } = await supabase.from("user_achievements").insert({
          user_id: userId,
          achievement_type: achievement.type,
          metadata: { progress_when_earned: progress },
        });

        if (!error) {
          newAchievements.push(achievement.type);
        }
      }
    }

    return {
      success: true,
      newAchievements,
    };
  } catch (error) {
    console.error("Error checking achievements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Award a specific achievement to a user
 */
export const awardAchievement = async (
  userId: string,
  achievementType: AchievementType,
  metadata?: any
) => {
  try {
    const { error } = await supabase.from("user_achievements").insert({
      user_id: userId,
      achievement_type: achievementType,
      metadata,
    });

    if (error) {
      // Check if it's a duplicate key error (already earned)
      if (error.code === "23505") {
        return { success: true }; // Achievement already earned, treat as success
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error awarding achievement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
