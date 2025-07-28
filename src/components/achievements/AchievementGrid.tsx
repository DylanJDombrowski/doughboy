// src/components/achievements/AchievementGrid.tsx
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SPACING } from "../../constants";
import { AchievementProgress } from "../../types";
import { AchievementBadge } from "./AchievementBadge";

interface AchievementGridProps {
  achievements: AchievementProgress[];
  size?: "small" | "medium" | "large";
  columns?: number;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  size = "medium",
  columns = 3,
}) => {
  // Sort achievements: earned first, then by progress
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.is_earned && !b.is_earned) return -1;
    if (!a.is_earned && b.is_earned) return 1;

    // If both earned or both not earned, sort by progress percentage
    const aProgress = (a.current_progress / a.target) * 100;
    const bProgress = (b.current_progress / b.target) * 100;
    return bProgress - aProgress;
  });

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < sortedAchievements.length; i += columns) {
      const rowAchievements = sortedAchievements.slice(i, i + columns);
      rows.push(
        <View key={i} style={styles.row}>
          {rowAchievements.map((achievement) => (
            <View
              key={achievement.achievement_type}
              style={styles.achievementContainer}
            >
              <AchievementBadge achievement={achievement} size={size} />
            </View>
          ))}
          {/* Fill empty slots in the last row */}
          {rowAchievements.length < columns &&
            Array.from(
              { length: columns - rowAchievements.length },
              (_, index) => (
                <View
                  key={`empty-${index}`}
                  style={styles.achievementContainer}
                />
              )
            )}
        </View>
      );
    }
    return rows;
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {renderRows()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  achievementContainer: {
    flex: 1,
    alignItems: "center",
  },
});
