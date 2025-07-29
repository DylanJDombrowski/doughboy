// src/services/achievementService.ts
import { supabase } from "./supabase";
import { UserAchievement, AchievementProgress, UserStats } from "../types";
import {
  ACHIEVEMENTS,
  AchievementType,
  getAllAchievements,
} from "../constants/achievements";

/**
 * Check and award achievements for a user
 */
export const checkAndAwardAchievements = async (
  userId: string
): Promise<{
  success: boolean;
  newAchievements: UserAchievement[];
  error?: string;
}> => {
  try {
    // Get user's current achievements
    const { data: existingAchievements, error: achievementError } =
      await supabase
        .from("user_achievements")
        .select("achievement_type")
        .eq("user_id", userId);

    if (achievementError) throw achievementError;

    const earnedTypes = new Set(
      existingAchievements?.map((a) => a.achievement_type) || []
    );

    // Get user stats for checking criteria
    const userStats = await getUserStats(userId);
    if (!userStats.success || !userStats.stats) {
      throw new Error("Failed to get user stats");
    }

    const stats = userStats.stats;
    const newAchievements: UserAchievement[] = [];

    // Check each achievement
    for (const achievement of getAllAchievements()) {
      if (earnedTypes.has(achievement.type)) continue;

      const shouldEarn = await checkAchievementCriteria(
        achievement.type,
        stats,
        userId
      );

      if (shouldEarn) {
        const { data: newAchievement, error: insertError } = await supabase
          .from("user_achievements")
          .insert({
            user_id: userId,
            achievement_type: achievement.type,
            metadata: {
              progress: getProgressForAchievement(achievement.type, stats),
              target: achievement.criteria.target,
            },
          })
          .select()
          .single();

        if (insertError) {
          console.error(
            `Error awarding achievement ${achievement.type}:`,
            insertError
          );
          continue;
        }

        if (newAchievement) {
          newAchievements.push(newAchievement as UserAchievement);
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
      newAchievements: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Check if user meets criteria for a specific achievement
 */
const checkAchievementCriteria = async (
  achievementType: AchievementType,
  stats: UserStats,
  userId: string
): Promise<boolean> => {
  const achievement = ACHIEVEMENTS[achievementType];

  switch (achievementType) {
    case "first_review":
      return stats.total_reviews >= 1;

    case "five_reviews":
      return stats.total_reviews >= 5;

    case "ten_places":
      return stats.total_pizzerias_visited >= 10;

    case "photo_reviewer":
      return stats.reviews_with_photos >= 5;

    case "style_explorer":
      return stats.unique_pizza_styles.length >= 3;

    case "local_expert":
      // Check if user has reviewed 5 places within a certain radius (e.g., 10 miles)
      return await checkLocalExpertCriteria(userId);

    case "consistent_reviewer":
      return stats.consecutive_review_days >= 7;

    default:
      return false;
  }
};

/**
 * Get progress value for achievement display
 */
const getProgressForAchievement = (
  achievementType: AchievementType,
  stats: UserStats
): number => {
  switch (achievementType) {
    case "first_review":
    case "five_reviews":
      return stats.total_reviews;
    case "ten_places":
      return stats.total_pizzerias_visited;
    case "photo_reviewer":
      return stats.reviews_with_photos;
    case "style_explorer":
      return stats.unique_pizza_styles.length;
    case "consistent_reviewer":
      return stats.consecutive_review_days;
    default:
      return 0;
  }
};

/**
 * Check local expert criteria (5 reviews within user's area)
 */
const checkLocalExpertCriteria = async (userId: string): Promise<boolean> => {
  try {
    // Get user's location
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("current_latitude, current_longitude")
      .eq("id", userId)
      .single();

    if (userError || !user?.current_latitude || !user?.current_longitude) {
      return false;
    }

    // Count reviews within 10 miles of user's location
    const { data: nearbyReviews, error: reviewError } = await supabase
      .from("pizzeria_ratings")
      .select(
        `
        id,
        pizzerias!inner(latitude, longitude)
      `
      )
      .eq("user_id", userId);

    if (reviewError) return false;

    let localReviewCount = 0;
    const userLat = user.current_latitude;
    const userLon = user.current_longitude;

    nearbyReviews?.forEach((review) => {
      const pizzeria = (review as any).pizzerias;
      if (pizzeria) {
        const distance = calculateDistance(
          userLat,
          userLon,
          pizzeria.latitude,
          pizzeria.longitude
        );
        if (distance <= 10) {
          // 10 miles
          localReviewCount++;
        }
      }
    });

    return localReviewCount >= 5;
  } catch (error) {
    console.error("Error checking local expert criteria:", error);
    return false;
  }
};

/**
 * Calculate distance between two coordinates in miles
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get comprehensive user statistics for achievement checking
 */
export const getUserStats = async (
  userId: string
): Promise<{
  success: boolean;
  stats?: UserStats;
  error?: string;
}> => {
  try {
    // Get all user reviews with pizzeria info
    const { data: reviews, error: reviewError } = await supabase
      .from("pizzeria_ratings")
      .select(
        `
        id,
        overall_rating,
        crust_rating,
        photos,
        created_at,
        pizzerias!inner(
          id,
          name,
          cuisine_styles,
          latitude,
          longitude
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (reviewError) throw reviewError;

    // Get user achievements
    const { data: achievements, error: achievementError } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId);

    if (achievementError) throw achievementError;

    // Initialize with safe defaults
    const safeReviews = reviews || [];
    const safeAchievements = achievements || [];

    // Calculate stats safely
    const totalReviews = safeReviews.length;
    const uniquePizzerias = new Set();
    const allStyles = new Set<string>();
    let reviewsWithPhotos = 0;
    let totalRating = 0;

    // Process reviews safely
    safeReviews.forEach((review) => {
      // Add to unique pizzerias
      const pizzeria = (review as any).pizzerias;
      if (pizzeria?.id) {
        uniquePizzerias.add(pizzeria.id);
      }

      // Count photos
      if (
        review.photos &&
        Array.isArray(review.photos) &&
        review.photos.length > 0
      ) {
        reviewsWithPhotos++;
      }

      // Add to total rating
      if (typeof review.overall_rating === "number") {
        totalRating += review.overall_rating;
      }

      // Add cuisine styles
      if (pizzeria?.cuisine_styles && Array.isArray(pizzeria.cuisine_styles)) {
        pizzeria.cuisine_styles.forEach((style: string) => {
          if (style) allStyles.add(style);
        });
      }
    });

    const totalPizzeriasVisited = uniquePizzerias.size;

    // Calculate consecutive review days
    const consecutiveDays = calculateConsecutiveReviewDays(safeReviews);

    // Calculate average rating safely
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    // Find most common style safely
    const styleCount: Record<string, number> = {};
    safeReviews.forEach((review) => {
      const pizzeria = (review as any).pizzerias;
      if (pizzeria?.cuisine_styles && Array.isArray(pizzeria.cuisine_styles)) {
        pizzeria.cuisine_styles.forEach((style: string) => {
          if (style) {
            styleCount[style] = (styleCount[style] || 0) + 1;
          }
        });
      }
    });

    // Find favorite style safely
    let favoriteStyle: string | undefined;
    const styleEntries = Object.entries(styleCount);
    if (styleEntries.length > 0) {
      favoriteStyle = styleEntries.reduce((prev, current) =>
        styleCount[prev[0]] > styleCount[current[0]] ? prev : current
      )[0];
    }

    const stats: UserStats = {
      total_reviews: totalReviews,
      total_pizzerias_visited: totalPizzeriasVisited,
      total_achievements: safeAchievements.length,
      reviews_with_photos: reviewsWithPhotos,
      unique_pizza_styles: Array.from(allStyles),
      consecutive_review_days: consecutiveDays,
      average_rating_given: Math.round(averageRating * 10) / 10,
      favorite_pizza_style: favoriteStyle,
      recent_reviews: safeReviews.slice(0, 5) as any,
      achievements: safeAchievements as UserAchievement[],
    };

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Calculate consecutive review days
 */
const calculateConsecutiveReviewDays = (reviews: any[]): number => {
  if (reviews.length === 0) return 0;

  // Group reviews by date
  const reviewDates = new Set(
    reviews.map((r) => new Date(r.created_at).toDateString())
  );

  const sortedDates = Array.from(reviewDates)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());

  let consecutiveDays = 1;
  let currentDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const nextDate = sortedDates[i];
    const diffTime = currentDate.getTime() - nextDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      consecutiveDays++;
      currentDate = nextDate;
    } else {
      break;
    }
  }

  return consecutiveDays;
};

/**
 * Get user's achievement progress for all achievements
 */
export const getAchievementProgress = async (
  userId: string
): Promise<{
  success: boolean;
  progress: AchievementProgress[];
  error?: string;
}> => {
  try {
    const { success, stats } = await getUserStats(userId);
    if (!success || !stats) {
      throw new Error("Failed to get user stats");
    }

    const { data: userAchievements, error: achievementError } = await supabase
      .from("user_achievements")
      .select("achievement_type, earned_at")
      .eq("user_id", userId);

    if (achievementError) throw achievementError;

    const earnedAchievements = new Map(
      userAchievements?.map((a) => [a.achievement_type, a.earned_at]) || []
    );

    const progress: AchievementProgress[] = getAllAchievements().map(
      (achievement) => {
        const currentProgress = getProgressForAchievement(
          achievement.type,
          stats
        );
        const isEarned = earnedAchievements.has(achievement.type);

        return {
          achievement_type: achievement.type,
          current_progress: currentProgress,
          target: achievement.criteria.target,
          percentage: Math.min(
            (currentProgress / achievement.criteria.target) * 100,
            100
          ),
          is_earned: isEarned,
          earned_at: earnedAchievements.get(achievement.type),
        };
      }
    );

    return {
      success: true,
      progress,
    };
  } catch (error) {
    console.error("Error getting achievement progress:", error);
    return {
      success: false,
      progress: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
