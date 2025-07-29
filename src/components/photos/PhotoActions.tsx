// src/components/photos/PhotoActions.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

interface PhotoActionsProps {
  photoUrl: string;
  visible: boolean;
  onShare?: () => void;
  onReport?: () => void;
  onViewProfile?: () => void;
  onSave?: () => void;
  reviewerName?: string;
  reviewerId?: string;
}

const PhotoActions: React.FC<PhotoActionsProps> = ({
  photoUrl,
  visible,
  onShare,
  onReport,
  onViewProfile,
  onSave,
  reviewerName,
  reviewerId,
}) => {
  const handleNativeShare = async () => {
    try {
      await Share.share({
        url: photoUrl,
        message: `Check out this pizza photo from ${
          reviewerName || "Doughboy"
        }!`,
      });
    } catch (error) {
      console.error("Error sharing photo:", error);
      Alert.alert("Error", "Failed to share photo");
    }
  };

  const handleSaveToDevice = async () => {
    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Permission needed to save photos to your device"
        );
        return;
      }

      // Download and save the image
      const downloadResult = await FileSystem.downloadAsync(
        photoUrl,
        FileSystem.documentDirectory + `pizza_photo_${Date.now()}.jpg`
      );

      if (downloadResult.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync("Doughboy", asset, false);

        Alert.alert("Success", "Photo saved to your photo library!");
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "Failed to save photo to device");
    }
  };

  const handleReport = () => {
    Alert.alert("Report Photo", "Why are you reporting this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Inappropriate Content",
        onPress: () => submitReport("inappropriate_content"),
      },
      {
        text: "Spam",
        onPress: () => submitReport("spam"),
      },
      {
        text: "Copyright Violation",
        onPress: () => submitReport("copyright"),
      },
      {
        text: "Other",
        onPress: () => submitReport("other"),
      },
    ]);
  };

  const submitReport = (reason: string) => {
    // In a real app, you'd submit this to your backend
    console.log("Reporting photo:", { photoUrl, reason, reviewerId });
    Alert.alert(
      "Thank You",
      "Your report has been submitted and will be reviewed."
    );
    onReport?.();
  };

  const handleViewProfile = () => {
    if (reviewerId) {
      // Navigate to user profile
      console.log("Viewing profile:", reviewerId);
      onViewProfile?.();
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.actionsGrid}>
        {/* Share Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShare || handleNativeShare}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="share-outline" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        {/* Save Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSave || handleSaveToDevice}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="download-outline" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        {/* View Profile Action */}
        {reviewerName && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewProfile}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="person-outline" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        )}

        {/* Report Action */}
        <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
          <View style={styles.actionIcon}>
            <Ionicons name="flag-outline" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Reviewer Info */}
      {reviewerName && (
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerText}>Photo by {reviewerName}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.md,
  },
  actionButton: {
    alignItems: "center",
    minWidth: 60,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },
  reviewerInfo: {
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  reviewerText: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.8,
  },
});

export default PhotoActions;
