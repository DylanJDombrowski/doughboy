// src/components/achievements/AchievementBadge.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import { Achievement } from "../../constants/achievements";
import { AchievementProgress } from "../../types";

interface AchievementBadgeProps {
  achievement: Achievement;
  progress?: AchievementProgress;
  size?: "small" | "medium" | "large";
  showProgress?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  progress,
  size = "medium",
  showProgress = true,
  onPress,
  style,
}) => {
  const isEarned = progress?.is_earned || false;
  const progressPercentage = progress?.percentage || 0;

  const sizeConfig = {
    small: { badgeSize: 60, iconSize: 28, fontSize: 12 },
    medium: { badgeSize: 80, iconSize: 36, fontSize: 14 },
    large: { badgeSize: 100, iconSize: 44, fontSize: 16 },
  };

  const config = sizeConfig[size];

  const badgeStyle = [
    styles.badge,
    {
      width: config.badgeSize,
      height: config.badgeSize,
      backgroundColor: isEarned ? achievement.color : COLORS.textMuted,
      opacity: isEarned ? 1 : 0.5,
    },
    style,
  ];

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={styles.container} onPress={onPress}>
      <View style={badgeStyle}>
        <Ionicons
          name={achievement.icon as any}
          size={config.iconSize}
          color={COLORS.white}
        />

        {/* Progress ring for unearned achievements */}
        {!isEarned && showProgress && progressPercentage > 0 && (
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressFill,
                {
                  transform: [
                    { rotate: `${(progressPercentage / 100) * 360}deg` },
                  ],
                  borderColor: achievement.color,
                },
              ]}
            />
          </View>
        )}
      </View>

      <Text
        style={[
          styles.name,
          {
            fontSize: config.fontSize,
            color: isEarned ? COLORS.text : COLORS.textLight,
          },
        ]}
        numberOfLines={2}
      >
        {achievement.name}
      </Text>

      {showProgress && progress && (
        <Text style={styles.progress}>
          {isEarned
            ? `Earned ${new Date(progress.earned_at!).toLocaleDateString()}`
            : `${progress.current_progress}/${progress.target}`}
        </Text>
      )}
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  badge: {
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 50,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  name: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SPACING.xs / 2,
  },
  progress: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});

export default AchievementBadge;
