// src/components/ratings/ReviewModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import { DualRatingInput } from "./DualRatingInput";
import { PhotoUpload } from "../upload";
import { uploadPhotos, STORAGE_BUCKETS } from "../../services/storage";
import { createOrUpdateRating } from "../../utils";
import { useAuth } from "../../hooks/useAuth";
import { checkAndAwardAchievements } from "../../services/achievementService";
import { AchievementModal } from "../achievements";
import { UserAchievement } from "../../types";

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  recipeId: string;
  onReviewSubmitted: () => void;
  initialRating?: {
    overallRating: number;
    crustRating: number;
    review?: string;
    photos?: string[];
  };
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  recipeId,
  onReviewSubmitted,
  initialRating,
}) => {
  const { user } = useAuth();
  const [overallRating, setOverallRating] = useState(
    initialRating?.overallRating || 0
  );
  const [crustRating, setCrustRating] = useState(
    initialRating?.crustRating || 0
  );
  const [review, setReview] = useState(initialRating?.review || "");
  const [photos, setPhotos] = useState<string[]>(initialRating?.photos || []);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAchievements, setNewAchievements] = useState<UserAchievement[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);

  // Reset form when modal opens or initialRating changes
  useEffect(() => {
    if (visible) {
      setOverallRating(initialRating?.overallRating || 0);
      setCrustRating(initialRating?.crustRating || 0);
      setReview(initialRating?.review || "");
      setPhotos(initialRating?.photos || []);
      setSelectedPhotos([]);
    }
  }, [visible, initialRating]);

  // Handle rating change from DualRatingInput
  const handleRatingChange = (
    newOverallRating: number,
    newCrustRating: number
  ) => {
    setOverallRating(newOverallRating);
    setCrustRating(newCrustRating);
  };

  // Handle photo selection
  const handlePhotosSelected = (newPhotos: string[]) => {
    setSelectedPhotos(newPhotos);
  };

  // Handle review submission
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You need to be logged in to submit a review");
      return;
    }

    if (overallRating === 0 || crustRating === 0) {
      Alert.alert(
        "Error",
        "Please rate both overall experience and crust quality"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload new photos if any
      let photoUrls = [...photos];

      if (selectedPhotos.length > 0) {
        const uploadResult = await uploadPhotos(
          selectedPhotos,
          STORAGE_BUCKETS.PIZZERIA_PHOTOS,
          recipeId
        );

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Failed to upload photos");
        }

        if (uploadResult.urls) {
          photoUrls = [...photoUrls, ...uploadResult.urls];
        }
      }

      // Create or update the rating
      const { success, error } = await createOrUpdateRating({
        recipe_id: recipeId,
        user_id: user.id,
        overall_rating: overallRating,
        crust_rating: crustRating,
        review: review.trim(),
        photos: photoUrls,
      });

      if (!success) {
        throw new Error(error || "Failed to submit review");
      }

      // Check for new achievements
      const achievementResult = await checkAndAwardAchievements(user.id);
      if (
        achievementResult.success &&
        achievementResult.newAchievements.length > 0
      ) {
        // REMOVE THIS SUCCESS ALERT - let achievement modal handle it
        setNewAchievements(achievementResult.newAchievements);
        setCurrentAchievementIndex(0);
        setShowAchievementModal(true);
      } else {
        // Only show success message if NO achievements
        Alert.alert("Success", "Your review has been submitted!");
        onReviewSubmitted();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAchievementModalClose = () => {
    if (currentAchievementIndex < newAchievements.length - 1) {
      // Show next achievement
      setCurrentAchievementIndex(currentAchievementIndex + 1);
    } else {
      // All achievements shown - close and show success
      setShowAchievementModal(false);
      setNewAchievements([]);
      setCurrentAchievementIndex(0);

      Alert.alert("Success", "Your review has been submitted!");
      onReviewSubmitted();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.centeredView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.modalView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Write a Review</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Rating</Text>
              <DualRatingInput
                initialOverallRating={overallRating}
                initialCrustRating={crustRating}
                onRatingChange={handleRatingChange}
              />
            </View>

            {/* Review Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Review (Optional)</Text>
              <TextInput
                style={styles.reviewInput}
                multiline
                placeholder="Share your experience with this pizzeria..."
                value={review}
                onChangeText={setReview}
                maxLength={500}
                editable={!isSubmitting}
              />
              <Text style={styles.characterCount}>
                {review.length}/500 characters
              </Text>
            </View>

            {/* Photo Upload Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
              <PhotoUpload
                maxPhotos={5}
                onPhotosSelected={handlePhotosSelected}
                initialPhotos={selectedPhotos}
              />
            </View>

            {/* Existing Photos Section (if editing) */}
            {photos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Existing Photos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoList}
                >
                  {photos.map((photo, index) => (
                    <View
                      key={`existing-photo-${index}`}
                      style={styles.photoContainer}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          // Remove photo from existing photos
                          const updatedPhotos = [...photos];
                          updatedPhotos.splice(index, 1);
                          setPhotos(updatedPhotos);
                        }}
                      >
                        <View style={styles.existingPhotoContainer}>
                          <Image
                            source={{ uri: photo }}
                            style={styles.existingPhoto}
                          />
                          <View style={styles.removeButton}>
                            <Ionicons
                              name="close-circle"
                              size={24}
                              color={COLORS.error}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || overallRating === 0 || crustRating === 0) &&
                styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || overallRating === 0 || crustRating === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Achievement Celebration Modal */}
      {showAchievementModal && newAchievements.length > 0 && (
        <AchievementModal
          visible={showAchievementModal}
          achievement={newAchievements[currentAchievementIndex]}
          onClose={handleAchievementModalClose}
          onShare={() => {
            // TODO: Implement sharing in Sprint 3
            console.log(
              "Share achievement:",
              newAchievements[currentAchievementIndex]
            );
          }}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    height: 120,
    textAlignVertical: "top",
    color: COLORS.text,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    alignSelf: "flex-end",
    marginTop: SPACING.xs,
  },
  photoList: {
    paddingVertical: SPACING.sm,
  },
  photoContainer: {
    marginRight: SPACING.sm,
  },
  existingPhotoContainer: {
    position: "relative",
  },
  existingPhoto: {
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
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ReviewModal;
