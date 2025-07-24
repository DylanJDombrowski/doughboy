// src/components/ratings/DualRatingDisplay.tsx
import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "./StarRating";
import { COLORS, SPACING } from "../../constants";

interface DualRatingDisplayProps {
  overallRating: number;
  crustRating: number;
  showLabels?: boolean;
  showValues?: boolean;
  size?: number;
  horizontal?: boolean;
  compact?: boolean;
  ratingCount?: number;
  style?: ViewStyle;
}

export const DualRatingDisplay: React.FC<DualRatingDisplayProps> = ({
  overallRating,
  crustRating,
  showLabels = true,
  showValues = true,
  size = 16,
  horizontal = false,
  compact = false,
  ratingCount,
  style,
}) => {
  // If we're in compact mode, we'll show a simplified version
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Text style={styles.ratingText}>
          Overall: <Ionicons name="star" size={size - 2} color={COLORS.primary} /> {overallRating.toFixed(1)}
          {" | "}
          Crust: <Ionicons name="star" size={size - 2} color={COLORS.primary} /> {crustRating.toFixed(1)}
          {ratingCount ? ` (${ratingCount})` : ""}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        horizontal ? styles.horizontalContainer : styles.container,
        style,
      ]}
    >
      <View style={styles.ratingRow}>
        {showLabels && <Text style={styles.label}>Overall:</Text>}
        <StarRating
          rating={overallRating}
          size={size}
          readOnly
          showValue={showValues}
        />
      </View>

      <View style={styles.ratingRow}>
        {showLabels && <Text style={styles.label}>Crust:</Text>}
        <StarRating
          rating={crustRating}
          size={size}
          readOnly
          showValue={showValues}
        />
      </View>

      {ratingCount !== undefined && (
        <Text style={styles.ratingCount}>
          based on {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  horizontalContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  label: {
    marginRight: SPACING.sm,
    width: 60,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  ratingCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  compactContainer: {
    paddingVertical: SPACING.xs,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default DualRatingDisplay;
