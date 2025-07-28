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
  icon: string;
  criteria: {
    target: number;
    description: string;
  };
}

export const ACHIEVEMENTS: Record<AchievementType, Achievement> = {
  first_review: {
    type: "first_review",
    name: "Pizza Pioneer",
    description: "Submit your first pizza review",
    icon: "flag-outline",
    criteria: {
      target: 1,
      description: "Submit 1 review",
    },
  },
  five_reviews: {
    type: "five_reviews",
    name: "Pizza Enthusiast",
    description: "Submit 5 pizza reviews",
    icon: "heart-outline",
    criteria: {
      target: 5,
      description: "Submit 5 reviews",
    },
  },
  ten_places: {
    type: "ten_places",
    name: "Pizza Explorer",
    description: "Visit 10 different pizzerias",
    icon: "map-outline",
    criteria: {
      target: 10,
      description: "Review 10 different pizzerias",
    },
  },
  photo_reviewer: {
    type: "photo_reviewer",
    name: "Pizza Photographer",
    description: "Submit 5 reviews with photos",
    icon: "camera-outline",
    criteria: {
      target: 5,
      description: "Submit 5 reviews with photos",
    },
  },
  style_explorer: {
    type: "style_explorer",
    name: "Style Sampler",
    description: "Try 3 different pizza styles",
    icon: "pizza-outline",
    criteria: {
      target: 3,
      description: "Review 3 different pizza styles",
    },
  },
  local_expert: {
    type: "local_expert",
    name: "Neighborhood Guru",
    description: "Review 5 places in your area",
    icon: "location-outline",
    criteria: {
      target: 5,
      description: "Review 5 places within 5km",
    },
  },
  consistent_reviewer: {
    type: "consistent_reviewer",
    name: "Pizza Critic",
    description: "Submit reviews for 7 consecutive days",
    icon: "time-outline",
    criteria: {
      target: 7,
      description: "7 consecutive days of reviews",
    },
  },
};

export const getAllAchievements = (): Achievement[] => {
  return Object.keys(ACHIEVEMENTS).map(
    (key) => ACHIEVEMENTS[key as AchievementType]
  );
};

export const getAchievementByType = (
  type: AchievementType
): Achievement | undefined => {
  return ACHIEVEMENTS[type];
};
