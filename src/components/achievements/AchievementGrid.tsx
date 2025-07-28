// src/components/achievements/AchievementGrid.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import {
  getAllAchievements,
  getAchievementByType,
} from "../../constants/achievements";
import { AchievementProgress } from "../../types";
import { AchievementBadge } from "./AchievementBadge";

interface AchievementGridProps {
  progress: AchievementProgress[];
  showTitle?: boolean;
  maxRows?: number;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  progress,
  showTitle = true,
  maxRows,
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(
    null
  );
  const [showAllModal, setShowAllModal] = useState(false);

  const achievements = getAllAchievements();
  const progressMap = new Map(progress.map((p) => [p.achievement_type, p]));

  const earnedCount = progress.filter((p) => p.is_earned).length;
  const totalCount = achievements.length;

  const displayAchievements = maxRows
    ? achievements.slice(0, maxRows * 3) // 3 per row
    : achievements;

  const renderAchievementDetail = () => {
    if (!selectedAchievement) return null;

    const achievement = getAchievementByType(selectedAchievement as any);
    const achievementProgress = progressMap.get(selectedAchievement as any);

    return (
      <Modal
        visible={selectedAchievement !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedAchievement(null)}
            >
              <Ionicons name="close" size={24} color={COLORS.textLight} />
            </TouchableOpacity>

            <AchievementBadge
              achievement={achievement}
              progress={achievementProgress}
              size="large"
              showProgress={false}
              style={styles.modalBadge}
            />

            <Text style={styles.modalTitle}>{achievement.name}</Text>
            <Text style={styles.modalDescription}>
              {achievement.description}
            </Text>

            {achievementProgress && (
              <View style={styles.modalProgress}>
                {achievementProgress.is_earned ? (
                  <View style={styles.earnedContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.success}
                    />
                    <Text style={styles.earnedText}>
                      Earned on{" "}
                      {new Date(
                        achievementProgress.earned_at!
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                      Progress: {achievementProgress.current_progress} /{" "}
                      {achievementProgress.target}
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${achievementProgress.percentage}%`,
                            backgroundColor: achievement.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressPercentage}>
                      {Math.round(achievementProgress.percentage)}% Complete
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderAllAchievementsModal = () => (
    <Modal
      visible={showAllModal}
      animationType="slide"
      onRequestClose={() => setShowAllModal(false)}
    >
      <SafeAreaView style={styles.allModalContainer}>
        <View style={styles.allModalHeader}>
          <Text style={styles.allModalTitle}>All Achievements</Text>
          <TouchableOpacity
            onPress={() => setShowAllModal(false)}
            style={styles.allModalClose}
          >
            <Ionicons name="close" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.allModalContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.type}
                achievement={achievement}
                progress={progressMap.get(achievement.type)}
                size="medium"
                onPress={() => {
                  setShowAllModal(false);
                  setSelectedAchievement(achievement.type);
                }}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.counter}>
            {earnedCount} / {totalCount}
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        {displayAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.type}
            achievement={achievement}
            progress={progressMap.get(achievement.type)}
            size="medium"
            onPress={() => setSelectedAchievement(achievement.type)}
          />
        ))}
      </View>

      {maxRows && achievements.length > maxRows * 3 && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setShowAllModal(true)}
        >
          <Text style={styles.viewAllText}>View All Achievements</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {renderAchievementDetail()}
      {renderAllAchievementsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  counter: {
    fontSize: 14,
    color: COLORS.textLight,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.round,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: SPACING.sm,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: "500",
    marginRight: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  modalBadge: {
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalProgress: {
    width: "100%",
  },
  earnedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.success + "20",
    borderRadius: BORDER_RADIUS.md,
  },
  earnedText: {
    marginLeft: SPACING.sm,
    color: COLORS.success,
    fontWeight: "500",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.sm,
  },
  progressPercentage: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  allModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  allModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  allModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  allModalClose: {
    padding: SPACING.xs,
  },
  allModalContent: {
    padding: SPACING.md,
  },
});

export default AchievementGrid;
