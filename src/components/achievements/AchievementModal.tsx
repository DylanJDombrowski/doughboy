// src/components/achievements/AchievementModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import { AchievementType } from "../../types";
import { getAchievementByType } from "../../constants/achievements";

interface AchievementModalProps {
  visible: boolean;
  achievementType: AchievementType | null;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  achievementType,
  onClose,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible, scaleValue]);

  if (!achievementType || !visible) {
    return null;
  }

  const achievement = getAchievementByType(achievementType);

  if (!achievement) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Celebration Effects */}
          <View style={styles.celebrationContainer}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationEmoji2}>✨</Text>
            <Text style={styles.celebrationEmoji3}>🍕</Text>
          </View>

          {/* Achievement Badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Ionicons
                name={achievement.icon as any}
                size={60}
                color={COLORS.white}
              />
            </View>
          </View>

          {/* Achievement Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.congratsText}>Congratulations!</Text>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    width: screenWidth * 0.85,
    maxWidth: 320,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  celebrationContainer: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    height: 40,
  },
  celebrationEmoji: {
    position: "absolute",
    top: 0,
    left: 20,
    fontSize: 24,
  },
  celebrationEmoji2: {
    position: "absolute",
    top: 10,
    right: 30,
    fontSize: 20,
  },
  celebrationEmoji3: {
    position: "absolute",
    top: 5,
    left: "50%",
    fontSize: 22,
    marginLeft: -11,
  },
  badgeContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  achievementName: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
