// src/components/upload/PhotoUpload.tsx - Fixed PhotoUpload Component
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
  onPhotosChange: (photos: string[]) => void;
  initialPhotos?: string[];
  disabled?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  maxPhotos = 5,
  onPhotosChange,
  initialPhotos = [],
  disabled = false,
}) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [loading, setLoading] = useState(false);

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

  const updatePhotos = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  const pickImages = async () => {
    if (disabled || photos.length >= maxPhotos) return;

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxPhotos - photos.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        const updatedPhotos = [...photos, ...newUris];
        updatePhotos(updatedPhotos);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (disabled || photos.length >= maxPhotos) return;

    try {
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        const updatedPhotos = [...photos, newUri];
        updatePhotos(updatedPhotos);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    updatePhotos(updatedPhotos);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Photos</Text>
        <Text style={styles.subtitle}>
          {photos.length}/{maxPhotos}
        </Text>
      </View>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photosList}
          contentContainerStyle={styles.photosContent}
        >
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            (disabled || photos.length >= maxPhotos) && styles.buttonDisabled,
          ]}
          onPress={pickImages}
          disabled={disabled || loading || photos.length >= maxPhotos}
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
            (disabled || photos.length >= maxPhotos) && styles.buttonDisabled,
          ]}
          onPress={takePhoto}
          disabled={disabled || loading || photos.length >= maxPhotos}
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

      {photos.length >= maxPhotos && (
        <Text style={styles.maxPhotosText}>
          Maximum {maxPhotos} photos reached
        </Text>
      )}
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
  photosList: {
    marginBottom: SPACING.md,
  },
  photosContent: {
    paddingVertical: SPACING.sm,
  },
  photoContainer: {
    marginRight: SPACING.sm,
    position: "relative",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.xs,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  maxPhotosText: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SPACING.sm,
  },
});

export default PhotoUpload;
