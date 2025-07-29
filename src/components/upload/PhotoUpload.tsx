// src/components/upload/PhotoUpload.tsx
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

interface PhotoUploadProps {
  maxPhotos?: number;
  onPhotosSelected: (photos: string[]) => void;
  initialPhotos?: string[];
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  maxPhotos = 5,
  onPhotosSelected,
  initialPhotos = [],
}) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [loading, setLoading] = useState(false);

  // Request permission to access the device's photo library
  const requestPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    try {
      // Check if user can add more photos
      if (photos.length >= maxPhotos) {
        Alert.alert(
          "Maximum Photos Reached",
          `You can only upload up to ${maxPhotos} photos.`,
          [{ text: "OK" }]
        );
        return;
      }

      // Request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      setLoading(true);

      // Open image picker - use string directly
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // Use string directly instead of enum
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxPhotos - photos.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Get selected photo URIs
        const newPhotos = result.assets.map((asset) => asset.uri);

        // Update state with new photos
        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);

        // Notify parent component
        onPhotosSelected(updatedPhotos);
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
      // Check if user can add more photos
      if (photos.length >= maxPhotos) {
        Alert.alert(
          "Maximum Photos Reached",
          `You can only upload up to ${maxPhotos} photos.`,
          [{ text: "OK" }]
        );
        return;
      }

      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your camera.",
          [{ text: "OK" }]
        );
        return;
      }

      setLoading(true);

      // Open camera - use string directly
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images", // Use string directly instead of enum
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Get captured photo URI
        const newPhoto = result.assets[0].uri;

        // Update state with new photo
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);

        // Notify parent component
        onPhotosSelected(updatedPhotos);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove a photo by index
  const removePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
    onPhotosSelected(updatedPhotos);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Photos</Text>
        <Text style={styles.subtitle}>
          {photos.length}/{maxPhotos} photos
        </Text>
      </View>

      {/* Photo preview section */}
      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
        >
          {photos.map((photo, index) => (
            <View key={`photo-${index}`} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Actions section */}
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
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  photoList: {
    paddingVertical: SPACING.sm,
  },
  photoContainer: {
    position: "relative",
    marginRight: SPACING.sm,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
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
    fontWeight: "600",
    marginLeft: SPACING.xs,
  },
});

export default PhotoUpload;
