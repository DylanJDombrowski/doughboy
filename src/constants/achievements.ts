// src/constants/achievements.ts
export type AchievementType =
  | "first_review"
  | "five_reviews"
  | "ten_places"
  | "photo_reviewer"
  | "style_explorer"
  | "local_expert"
  | "consistent_reviewer";

export interface Achievement {
  type: AchievementType;
  name: string;
  description: string;
  icon: string; // Ionicon name
  color: string;
  criteria: {
    target: number;
    type: "reviews" | "places" | "photos" | "styles" | "consecutive_days";
    timeframe?: "all_time" | "weekly" | "monthly";
  };
}

export const ACHIEVEMENTS: Record<AchievementType, Achievement> = {
  first_review: {
    type: "first_review",
    name: "Pizza Pioneer",
    description: "Submit your first review",
    icon: "flag",
    color: "#4CAF50",
    criteria: {
      target: 1,
      type: "reviews",
      timeframe: "all_time",
    },
  },
  five_reviews: {
    type: "five_reviews",
    name: "Pizza Enthusiast",
    description: "Submit 5 reviews",
    icon: "star",
    color: "#FF9800",
    criteria: {
      target: 5,
      type: "reviews",
      timeframe: "all_time",
    },
  },
  ten_places: {
    type: "ten_places",
    name: "Pizza Explorer",
    description: "Visit 10 different pizzerias",
    icon: "map",
    color: "#2196F3",
    criteria: {
      target: 10,
      type: "places",
      timeframe: "all_time",
    },
  },
  photo_reviewer: {
    type: "photo_reviewer",
    name: "Pizza Photographer",
    description: "Submit 5 reviews with photos",
    icon: "camera",
    color: "#9C27B0",
    criteria: {
      target: 5,
      type: "photos",
      timeframe: "all_time",
    },
  },
  style_explorer: {
    type: "style_explorer",
    name: "Style Sampler",
    description: "Try 3 different pizza styles",
    icon: "restaurant",
    color: "#FF5722",
    criteria: {
      target: 3,
      type: "styles",
      timeframe: "all_time",
    },
  },
  local_expert: {
    type: "local_expert",
    name: "Neighborhood Guru",
    description: "Review 5 places in your area",
    icon: "location",
    color: "#795548",
    criteria: {
      target: 5,
      type: "places",
      timeframe: "all_time",
    },
  },
  consistent_reviewer: {
    type: "consistent_reviewer",
    name: "Pizza Critic",
    description: "Submit reviews for 7 consecutive days",
    icon: "trophy",
    color: "#FFD700",
    criteria: {
      target: 7,
      type: "consecutive_days",
      timeframe: "weekly",
    },
  },
};

export const getAllAchievements = (): Achievement[] => {
  return Object.values(ACHIEVEMENTS);
};

export const getAchievementByType = (type: AchievementType): Achievement => {
  return ACHIEVEMENTS[type];
};
