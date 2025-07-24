// src/utils/index.ts
export * from "./rating";
export * from "./pizzeriaRating";
export * from "./savedPizzeria";

// Re-export specific functions that are being imported
export { createOrUpdateRating, getRatingStats } from "./rating";

export {
  createOrUpdatePizzeriaRating,
  getPizzeriaRatingStats,
} from "./pizzeriaRating";

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
};

export const formatHydration = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

export const formatDifficulty = (level: number): string => {
  const difficulties = [
    "",
    "Beginner",
    "Easy",
    "Intermediate",
    "Advanced",
    "Expert",
  ];
  return difficulties[level] || "Unknown";
};

export const formatDistance = (miles: number): string => {
  if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const generateRecipeUrl = (recipe: {
  id: string;
  title: string;
}): string => {
  return `/recipe/${recipe.id}/${slugify(recipe.title)}`;
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};
