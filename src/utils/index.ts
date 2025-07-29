// src/utils/index.ts - Updated to include createOrUpdateRating
export * from "./pizzeriaRating";
export * from "./savedPizzeria";

// Import the function from pizzeriaRating and re-export with both names for compatibility
export {
  createOrUpdatePizzeriaRating,
  getPizzeriaRatingStats,
} from "./pizzeriaRating";

// Add this compatibility export for ReviewModal
export { createOrUpdatePizzeriaRating as createOrUpdateRating } from "./pizzeriaRating";

// Utility functions
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

export const formatDistance = (miles: number): string => {
  if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
};

export const formatPriceRange = (priceRange: number): string => {
  const prices = ["", "$", "$$", "$$$", "$$$$"];
  return prices[priceRange] || "N/A";
};

export const formatBusinessType = (businessType: string | null): string => {
  if (!businessType) return "Unknown";

  const types: { [key: string]: string } = {
    chain: "Chain",
    independent: "Independent",
    franchise: "Franchise",
  };
  return types[businessType.toLowerCase()] || businessType;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const generatePizzeriaUrl = (pizzeria: {
  id: string;
  name: string;
}): string => {
  return `/pizzeria/${pizzeria.id}/${slugify(pizzeria.name)}`;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const calculateDistance = (
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
