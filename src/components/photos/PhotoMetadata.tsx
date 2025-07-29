// src/components/photos/PhotoMetadata.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import { DualRatingDisplay } from "../ratings";

export interface PhotoMetadata {
  uploadedAt: string;
  originalSize: { width: number; height: number };
  compressedSize: { width: number; height: number };
  location?: { latitude: number; longitude: number };
  reviewId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  overallRating: number;
  crustRating: number;
  reviewText?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  metadata: PhotoMetadata;
}

interface PhotoMetadataProps {
  photo: GalleryPhoto;
  visible: boolean;
  onToggle: () => void;
  position?: "bottom" | "top";
}

const PhotoMetadataOverlay: React.FC<PhotoMetadataProps> = ({
  photo,
  visible,
  onToggle,
  position = "bottom",
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const overlayStyle = [
    styles.overlay,
    position === "top" ? styles.overlayTop : styles.overlayBottom,
    {
      opacity: fadeAnim,
      transform: [
        {
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: position === "bottom" ? [100, 0] : [-100, 0],
          }),
        },
      ],
    },
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name={visible ? "information-circle" : "information-circle-outline"}
          size={24}
          color={COLORS.white}
        />
      </TouchableOpacity>

      <Animated.View
        style={overlayStyle}
        pointerEvents={visible ? "auto" : "none"}
      >
        <View style={styles.metadataContainer}>
          {/* Reviewer Info */}
          <View style={styles.reviewerSection}>
            <View style={styles.reviewerInfo}>
              <View style={styles.avatarContainer}>
                {photo.metadata.reviewerAvatar ? (
                  <Image
                    source={{ uri: photo.metadata.reviewerAvatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons
                      name="person"
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </View>
                )}
              </View>
              <View style={styles.reviewerDetails}>
                <Text style={styles.reviewerName}>
                  {photo.metadata.reviewerName}
                </Text>
                <Text style={styles.uploadDate}>
                  {formatDate(photo.metadata.uploadedAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Ratings */}
          <View style={styles.ratingsSection}>
            <DualRatingDisplay
              overallRating={photo.metadata.overallRating}
              crustRating={photo.metadata.crustRating}
              compact={true}
              size={14}
              showLabels={false}
            />
          </View>

          {/* Review Preview */}
          {photo.metadata.reviewText && (
            <View style={styles.reviewSection}>
              <Text style={styles.reviewText} numberOfLines={2}>
                "{photo.metadata.reviewText}"
              </Text>
            </View>
          )}

          {/* Photo Details */}
          <View style={styles.photoDetailsSection}>
            <View style={styles.photoDetail}>
              <Ionicons
                name="resize-outline"
                size={14}
                color={COLORS.textMuted}
              />
              <Text style={styles.photoDetailText}>
                {photo.metadata.originalSize.width} ×{" "}
                {photo.metadata.originalSize.height}
              </Text>
            </View>
            {photo.metadata.location && (
              <View style={styles.photoDetail}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={COLORS.textMuted}
                />
                <Text style={styles.photoDetailText}>
                  {photo.metadata.location.latitude.toFixed(4)},{" "}
                  {photo.metadata.location.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.sm,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    zIndex: 5,
  },
  overlayTop: {
    top: 0,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  overlayBottom: {
    bottom: 0,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  metadataContainer: {
    gap: SPACING.md,
  },
  reviewerSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  uploadDate: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  ratingsSection: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  reviewSection: {
    paddingVertical: SPACING.xs,
  },
  reviewText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  photoDetailsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  photoDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  photoDetailText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});

export default PhotoMetadataOverlay;
