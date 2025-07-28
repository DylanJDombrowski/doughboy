// src/components/achievements/AchievementModal.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import { UserAchievement } from "../../types";
import { getAchievementByType } from "../../constants/achievements";
import { AchievementBadge } from "./AchievementBadge";

interface AchievementModalProps {
  visible: boolean;
  achievement: UserAchievement | null;
  onClose: () => void;
  onShare?: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  achievement,
  onClose,
  onShare,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      confettiAnim.setValue(0);

      // Start celebration animation sequence
      Animated.sequence([
        // Scale in the badge
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Rotate celebration
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Confetti animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, achievement]);

  if (!achievement) return null;

  const achievementData = getAchievementByType(achievement.achievement_type);

  const scaleInterpolate = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const confettiOpacity = confettiAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const confettiTranslateY = confettiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Confetti particles */}
        {[...Array(8)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                left: (screenWidth / 9) * (index + 1),
                backgroundColor:
                  index % 2 === 0 ? COLORS.primary : achievementData.color,
                opacity: confettiOpacity,
                transform: [
                  {
                    translateY: confettiTranslateY,
                  },
                  {
                    rotate: rotateInterpolate,
                  },
                ],
              },
            ]}
          />
        ))}

        <View style={styles.container}>
          <View style={styles.content}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textLight} />
            </TouchableOpacity>

            {/* Celebration header */}
            <Text style={styles.celebrationText}>
              🎉 Achievement Unlocked! 🎉
            </Text>

            {/* Animated achievement badge */}
            <Animated.View
              style={[
                styles.badgeContainer,
                {
                  transform: [
                    { scale: scaleInterpolate },
                    { rotate: rotateInterpolate },
                  ],
                },
              ]}
            >
              <AchievementBadge
                achievement={achievementData}
                progress={{
                  achievement_type: achievement.achievement_type,
                  current_progress: achievementData.criteria.target,
                  target: achievementData.criteria.target,
                  percentage: 100,
                  is_earned: true,
                  earned_at: achievement.earned_at,
                }}
                size="large"
                showProgress={false}
              />
            </Animated.View>

            {/* Achievement details */}
            <Text style={styles.achievementName}>{achievementData.name}</Text>
            <Text style={styles.achievementDescription}>
              {achievementData.description}
            </Text>

            {/* Achievement context */}
            {achievement.metadata?.context && (
              <View style={styles.contextContainer}>
                <Ionicons name="location" size={16} color={COLORS.primary} />
                <Text style={styles.contextText}>
                  Achieved at {achievement.metadata.context}
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              {onShare && (
                <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                  <Ionicons
                    name="share-social"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.continueButton} onPress={onClose}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  confetti: {
    position: "absolute",
    top: "20%",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  container: {
    width: screenWidth * 0.85,
    maxWidth: 350,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
    padding: SPACING.xs,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  badgeContainer: {
    marginBottom: SPACING.lg,
  },
  achievementName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  achievementDescription: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  contextContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  contextText: {
    marginLeft: SPACING.xs,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    width: "100%",
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  shareButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  },
  continueButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  continueButtonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AchievementModal;
