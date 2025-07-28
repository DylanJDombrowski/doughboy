// src/components/achievements/AchievementBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import { AchievementProgress } from "../../types";
import { getAchievementByType } from "../../constants/achievements";

interface AchievementBadgeProps {
  achievement: AchievementProgress;
  size?: "small" | "medium" | "large";
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = "medium",
}) => {
  const achievementConfig = getAchievementByType(achievement.achievement_type);

  if (!achievementConfig) {
    return null;
  }

  const isEarned = achievement.is_earned;
  const progress = Math.min(achievement.current_progress, achievement.target);
  const progressPercentage = (progress / achievement.target) * 100;

  const badgeSize = size === "small" ? 60 : size === "large" ? 100 : 80;
  const iconSize = size === "small" ? 24 : size === "large" ? 40 : 32;
  const fontSize = size === "small" ? 10 : size === "large" ? 14 : 12;

  const badgeStyle = [
    styles.badge,
    {
      width: badgeSize,
      height: badgeSize,
      opacity: isEarned ? 1 : 0.5,
      backgroundColor: isEarned ? COLORS.primary : "#E0E0E0",
    },
  ];

  const textColor = isEarned ? COLORS.white : COLORS.textMuted;

  return (
    <View style={styles.container}>
      <View style={badgeStyle}>
        <Ionicons
          name={achievementConfig.icon as any}
          size={iconSize}
          color={textColor}
        />
        {!isEarned && progressPercentage > 0 && (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { fontSize: fontSize - 2 }]}>
              {progress}/{achievement.target}
            </Text>
          </View>
        )}
      </View>

      {size !== "small" && (
        <View style={styles.textContainer}>
          <Text
            style={[styles.achievementName, { fontSize }]}
            numberOfLines={2}
          >
            {achievementConfig.name}
          </Text>
          <Text
            style={[styles.achievementDescription, { fontSize: fontSize - 2 }]}
            numberOfLines={3}
          >
            {achievementConfig.description}
          </Text>
          {!isEarned && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  badge: {
    borderRadius: BORDER_RADIUS.round,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressContainer: {
    position: "absolute",
    bottom: -8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressText: {
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  textContainer: {
    marginTop: SPACING.sm,
    alignItems: "center",
    maxWidth: 120,
  },
  achievementName: {
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 2,
  },
  achievementDescription: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
});
