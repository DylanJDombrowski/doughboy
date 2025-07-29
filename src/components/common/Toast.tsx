// src/components/common/Toast.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
  position?: "top" | "bottom";
}

const { width: screenWidth } = Dimensions.get("window");

const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  title,
  message,
  duration = 3000,
  onHide,
  position = "top",
}) => {
  const translateY = useRef(
    new Animated.Value(position === "top" ? -100 : 100)
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === "top" ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: COLORS.success,
          icon: "checkmark-circle",
          iconColor: COLORS.white,
        };
      case "error":
        return {
          backgroundColor: COLORS.error,
          icon: "close-circle",
          iconColor: COLORS.white,
        };
      case "warning":
        return {
          backgroundColor: COLORS.warning,
          icon: "warning",
          iconColor: COLORS.white,
        };
      case "info":
        return {
          backgroundColor: COLORS.primary,
          icon: "information-circle",
          iconColor: COLORS.white,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          icon: "information-circle",
          iconColor: COLORS.white,
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === "top" ? styles.containerTop : styles.containerBottom,
        { backgroundColor: config.backgroundColor },
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity onPress={hideToast} style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={config.icon as any}
            size={24}
            color={config.iconColor}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>

        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  containerTop: {
    top: 60,
  },
  containerBottom: {
    bottom: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  message: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
});

export default Toast;
