// src/components/photos/PhotoGallery.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  userId: string;
  userName?: string;
}

interface PhotoGalleryProps {
  photos: string[] | Photo[];
  columns?: number;
  spacing?: number;
  onPhotoPress?: (photoUrl: string, index: number) => void;
  showMetadata?: boolean;
  enableLightbox?: boolean;
  maxPhotos?: number;
  emptyStateText?: string;
  filterOptions?: {
    sortBy?: "newest" | "oldest" | "rating";
    filterBy?: "all" | "rated" | "recent";
  };
}

const { width: screenWidth } = Dimensions.get("window");

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = [],
  columns = 2,
  spacing = SPACING.sm,
  onPhotoPress,
  showMetadata = false,
  enableLightbox = true,
  maxPhotos,
  emptyStateText = "No photos available",
  filterOptions,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Convert photos to uniform format
  const normalizedPhotos = photos.map((photo, index) => {
    if (typeof photo === "string") {
      return {
        id: `photo-${index}`,
        url: photo,
        uploadedAt: new Date().toISOString(),
        userId: "",
      };
    }
    return photo;
  });

  // Apply max photos limit
  const displayPhotos = maxPhotos
    ? normalizedPhotos.slice(0, maxPhotos)
    : normalizedPhotos;

  // Calculate photo dimensions
  const photoWidth = (screenWidth - spacing * (columns + 1)) / columns;
  const photoHeight = photoWidth;

  const handlePhotoPress = (photo: Photo, index: number) => {
    if (onPhotoPress) {
      onPhotoPress(photo.url, index);
    }
  };

  const handleImageError = (photoId: string) => {
    setImageErrors((prev) => new Set([...prev, photoId]));
  };

  const renderPhoto = (photo: Photo, index: number) => {
    const hasError = imageErrors.has(photo.id);

    return (
      <TouchableOpacity
        key={photo.id}
        style={[
          styles.photoContainer,
          {
            width: photoWidth,
            height: photoHeight,
            marginBottom: spacing,
            marginRight: (index + 1) % columns === 0 ? 0 : spacing,
          },
        ]}
        onPress={() => handlePhotoPress(photo, index)}
        disabled={hasError}
      >
        {!hasError ? (
          <Image
            source={{ uri: photo.url }}
            style={styles.photo}
            onError={() => handleImageError(photo.id)}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.photo, styles.errorPhoto]}>
            <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.errorText}>Failed to load</Text>
          </View>
        )}

        {showMetadata && (
          <View style={styles.metadataOverlay}>
            <Text style={styles.metadataText} numberOfLines={1}>
              {photo.userName || "Anonymous"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  if (displayPhotos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>{emptyStateText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={[styles.grid, { paddingHorizontal: spacing }]}>
          {displayPhotos.map((photo, index) => renderPhoto(photo, index))}
        </View>
      </ScrollView>

      {maxPhotos && photos.length > maxPhotos && (
        <TouchableOpacity style={styles.viewMoreButton}>
          <Text style={styles.viewMoreText}>
            View all {photos.length} photos
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: SPACING.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photoContainer: {
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photo: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.secondary,
  },
  errorPhoto: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  metadataOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: SPACING.xs,
  },
  metadataText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.textLight,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.textLight,
    fontSize: 16,
    textAlign: "center",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  viewMoreText: {
    color: COLORS.primary,
    fontWeight: "500",
    marginRight: SPACING.xs,
  },
});

export default PhotoGallery;
