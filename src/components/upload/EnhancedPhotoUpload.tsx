// src/components/upload/EnhancedPhotoUpload.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

interface PhotoUploadItem {
  uri: string;
  status: "uploading" | "uploaded" | "error";
  progress?: number;
  error?: string;
}

interface EnhancedPhotoUploadProps {
  maxPhotos?: number;
  onPhotosSelected: (photos: string[]) => void;
  initialPhotos?: string[];
  quality?: "high" | "medium" | "low";
  enablePreview?: boolean;
  showProgress?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

const EnhancedPhotoUpload: React.FC<EnhancedPhotoUploadProps> = ({
  maxPhotos = 5,
  onPhotosSelected,
  initialPhotos = [],
  quality = "medium",
  enablePreview = true,
  showProgress = true,
}) => {
  const [photos, setPhotos] = useState<PhotoUploadItem[]>(
    initialPhotos.map((uri) => ({ uri, status: "uploaded" }))
  );
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quality settings
  const qualitySettings = {
    high: { compress: 0.9, width: 1920 },
    medium: { compress: 0.7, width: 1200 },
    low: { compress: 0.5, width: 800 },
  };

  const currentQuality = qualitySettings[quality];

  const requestPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photos."
      );
      return false;
    }
    return true;
  };

  const updatePhotoStatus = (
    uri: string,
    status: PhotoUploadItem["status"],
    progress?: number,
    error?: string
  ) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.uri === uri ? { ...photo, status, progress, error } : photo
      )
    );
  };

  const simulateUpload = async (uri: string) => {
    updatePhotoStatus(uri, "uploading", 0);

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      updatePhotoStatus(uri, "uploading", progress);
    }

    // Randomly simulate success or error for demo
    if (Math.random() > 0.1) {
      updatePhotoStatus(uri, "uploaded");
    } else {
      updatePhotoStatus(uri, "error", undefined, "Upload failed");
    }
  };

  const addPhotos = async (newUris: string[]) => {
    const newPhotos: PhotoUploadItem[] = newUris.map((uri) => ({
      uri,
      status: "uploading" as const,
      progress: 0,
    }));

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);

    // Simulate individual upload for each photo
    newUris.forEach((uri) => {
      simulateUpload(uri);
    });

    // Update parent with successful photos
    const successfulUris = updatedPhotos
      .filter((photo) => photo.status === "uploaded")
      .map((photo) => photo.uri);
    onPhotosSelected(successfulUris);
  };

  const pickImages = async () => {
    try {
      if (photos.length >= maxPhotos) {
        Alert.alert(
          "Maximum Photos Reached",
          `You can only upload up to ${maxPhotos} photos.`
        );
        return;
      }

      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsMultipleSelection: true,
        quality: currentQuality.compress,
        selectionLimit: maxPhotos - photos.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        await addPhotos(newUris);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      if (photos.length >= maxPhotos) {
        Alert.alert(
          "Maximum Photos Reached",
          `You can only upload up to ${maxPhotos} photos.`
        );
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your camera."
        );
        return;
      }

      setLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images" as any,
        quality: currentQuality.compress,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        await addPhotos([newUri]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (uri: string) => {
    const updatedPhotos = photos.filter((photo) => photo.uri !== uri);
    setPhotos(updatedPhotos);

    const successfulUris = updatedPhotos
      .filter((photo) => photo.status === "uploaded")
      .map((photo) => photo.uri);
    onPhotosSelected(successfulUris);
  };

  const retryUpload = (uri: string) => {
    simulateUpload(uri);
  };

  const renderPhotoItem = (photo: PhotoUploadItem, index: number) => {
    const { uri, status, progress, error } = photo;

    return (
      <View key={uri} style={styles.photoContainer}>
        <TouchableOpacity
          onPress={() => enablePreview && setPreviewPhoto(uri)}
          style={styles.photoTouchable}
        >
          <Image source={{ uri }} style={styles.photo} />

          {/* Status overlay */}
          {status === "uploading" && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color={COLORS.white} />
              {showProgress && progress !== undefined && (
                <Text style={styles.progressText}>{progress}%</Text>
              )}
            </View>
          )}

          {status === "uploaded" && (
            <View style={styles.successOverlay}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.success}
              />
            </View>
          )}

          {status === "error" && (
            <View style={styles.errorOverlay}>
              <TouchableOpacity onPress={() => retryUpload(uri)}>
                <Ionicons name="refresh" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {/* Remove button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removePhoto(uri)}
        >
          <Ionicons name="close-circle" size={24} color={COLORS.error} />
        </TouchableOpacity>

        {/* Progress bar */}
        {status === "uploading" && showProgress && progress !== undefined && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        )}

        {/* Error message */}
        {status === "error" && error && (
          <Text style={styles.errorText} numberOfLines={1}>
            {error}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Photos</Text>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>
            {photos.length}/{maxPhotos}
          </Text>
          <Text style={styles.qualityBadge}>{quality.toUpperCase()}</Text>
        </View>
      </View>

      {/* Quality selector */}
      <View style={styles.qualitySelector}>
        <Text style={styles.qualityLabel}>Quality:</Text>
        {(["high", "medium", "low"] as const).map((q) => (
          <TouchableOpacity
            key={q}
            style={[
              styles.qualityOption,
              quality === q && styles.qualityOptionActive,
            ]}
            onPress={() => {
              // Note: In real implementation, you'd want to update the quality
              // This is just for demonstration
            }}
          >
            <Text
              style={[
                styles.qualityOptionText,
                quality === q && styles.qualityOptionTextActive,
              ]}
            >
              {q.charAt(0).toUpperCase() + q.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Photo grid */}
      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
        >
          {photos.map((photo, index) => renderPhotoItem(photo, index))}
        </ScrollView>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.button,
            photos.length >= maxPhotos && styles.disabledButton,
          ]}
          onPress={pickImages}
          disabled={loading || photos.length >= maxPhotos}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="images-outline" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Gallery</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            photos.length >= maxPhotos && styles.disabledButton,
          ]}
          onPress={takePhoto}
          disabled={loading || photos.length >= maxPhotos}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Camera</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Upload summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {photos.filter((p) => p.status === "uploaded").length} uploaded,{" "}
          {photos.filter((p) => p.status === "uploading").length} uploading,{" "}
          {photos.filter((p) => p.status === "error").length} failed
        </Text>
      </View>

      {/* Photo preview modal */}
      <Modal
        visible={previewPhoto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <View style={styles.previewModal}>
          <TouchableOpacity
            style={styles.previewClose}
            onPress={() => setPreviewPhoto(null)}
          >
            <Ionicons name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>

          {previewPhoto && (
            <Image
              source={{ uri: previewPhoto }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  qualityBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.primary,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  qualitySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  qualityLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: SPACING.sm,
  },
  qualityOption: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
  },
  qualityOptionActive: {
    backgroundColor: COLORS.primary,
  },
  qualityOptionText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  qualityOptionTextActive: {
    color: COLORS.white,
  },
  photoList: {
    paddingVertical: SPACING.sm,
  },
  photoContainer: {
    marginRight: SPACING.sm,
    position: "relative",
  },
  photoTouchable: {
    position: "relative",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    color: COLORS.white,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  successOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,0,0,0.7)",
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  progressBarContainer: {
    marginTop: 4,
    height: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  errorText: {
    fontSize: 10,
    color: COLORS.error,
    marginTop: 2,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: "48%",
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  summary: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
  },
  previewModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: SPACING.sm,
  },
  previewImage: {
    width: screenWidth,
    height: "80%",
  },
});

export default EnhancedPhotoUpload;
