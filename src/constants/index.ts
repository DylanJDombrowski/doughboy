// src/constants/index.ts
export const DOUGH_CATEGORIES = [
  { value: "neapolitan", label: "Neapolitan" },
  { value: "ny_style", label: "New York Style" },
  { value: "chicago_deep_dish", label: "Chicago Deep Dish" },
  { value: "sicilian", label: "Sicilian" },
  { value: "focaccia", label: "Focaccia" },
  { value: "sourdough", label: "Sourdough" },
  { value: "detroit_style", label: "Detroit Style" },
  { value: "pan_pizza", label: "Pan Pizza" },
  { value: "thin_crust", label: "Thin Crust" },
  { value: "whole_wheat", label: "Whole Wheat" },
  { value: "gluten_free", label: "Gluten Free" },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 1, label: "Beginner", description: "Easy for anyone to make" },
  { value: 2, label: "Easy", description: "Some basic techniques required" },
  {
    value: 3,
    label: "Intermediate",
    description: "Moderate skill level needed",
  },
  {
    value: 4,
    label: "Advanced",
    description: "Requires experience and precision",
  },
  { value: 5, label: "Expert", description: "Professional-level techniques" },
] as const;

export const MEASUREMENT_UNITS = [
  "grams",
  "ounces",
  "cups",
  "tablespoons",
  "teaspoons",
  "milliliters",
  "fluid ounces",
  "pounds",
  "kilograms",
] as const;

export const COLORS = {
  primary: "#D4A574",
  primaryDark: "#8B4513",
  secondary: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
  textMuted: "#999999",
  background: "#F5F5F5",
  white: "#FFFFFF",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#FF3B30",
  border: "#E0E0E0",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
} as const;
