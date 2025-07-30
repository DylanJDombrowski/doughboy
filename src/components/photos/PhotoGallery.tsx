// src/components/photos/PhotoGallery.tsx - Enhanced PhotoGallery Component
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
  style?: any;
  height?: number;
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
  style,
  height,
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
  const availableWidth = screenWidth - spacing * (columns + 1);
  const photoWidth = availableWidth / columns;
  const photoHeight = height
    ? height / Math.ceil(displayPhotos.length / columns)
    : photoWidth;

  const handlePhotoPress = (photo: Photo, index: number) => {
    if (onPhotoPress && enableLightbox) {
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
        disabled={hasError || !enableLightbox}
        activeOpacity={0.8}
      >
        {!hasError ? (
          <>
            <Image
              source={{ uri: photo.url }}
              style={styles.photo}
              onError={() => handleImageError(photo.id)}
              resizeMode="cover"
            />

            {/* Photo overlay for better UX */}
            {enableLightbox && (
              <View style={styles.photoOverlay}>
                <Ionicons
                  name="expand-outline"
                  size={20}
                  color={COLORS.white}
                />
              </View>
            )}
          </>
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
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  if (displayPhotos.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Ionicons name="images-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>{emptyStateText}</Text>
        <Text style={styles.emptySubtext}>
          Add photos to reviews to share your pizza experiences!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {columns === 1 ? (
        // Single column layout (hero image style)
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          contentContainerStyle={styles.heroContainer}
        >
          {displayPhotos.map((photo, index) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.heroPhoto}
              onPress={() => handlePhotoPress(photo, index)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: photo.url }}
                style={styles.heroImage}
                resizeMode="cover"
                onError={() => handleImageError(photo.id)}
              />

              {enableLightbox && (
                <View style={styles.heroOverlay}>
                  <View style={styles.photoCounter}>
                    <Text style={styles.photoCounterText}>
                      {index + 1} / {displayPhotos.length}
                    </Text>
                  </View>
                  <Ionicons
                    name="expand-outline"
                    size={24}
                    color={COLORS.white}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        // Grid layout
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={[styles.grid, { paddingHorizontal: spacing }]}>
            {displayPhotos.map((photo, index) => renderPhoto(photo, index))}
          </View>
        </ScrollView>
      )}

      {maxPhotos && photos.length > maxPhotos && (
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => {
            // Could trigger a "view all photos" modal here
            console.log("View all photos requested");
          }}
        >
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
  heroContainer: {
    paddingHorizontal: 0,
  },
  heroPhoto: {
    width: screenWidth,
    height: 250,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  photoCounter: {
    marginRight: SPACING.sm,
  },
  photoCounterText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
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
  photoOverlay: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
    opacity: 0.8,
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
    minHeight: 200,
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
    minHeight: 200,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.textLight,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: SPACING.xs,
    color: COLORS.textMuted,
    fontSize: 14,
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
