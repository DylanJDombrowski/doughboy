// src/components/ratings/DualRatingInput.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextInput,
  TouchableOpacity,
} from "react-native";
import StarRating from "./StarRating";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

interface DualRatingInputProps {
  initialOverallRating?: number;
  initialCrustRating?: number;
  onRatingChange: (overallRating: number, crustRating: number) => void;
  onSubmitReview?: (review: string) => void;
  allowReview?: boolean;
  style?: ViewStyle;
}

export const DualRatingInput: React.FC<DualRatingInputProps> = ({
  initialOverallRating = 0,
  initialCrustRating = 0,
  onRatingChange,
  onSubmitReview,
  allowReview = false,
  style,
}) => {
  const [overallRating, setOverallRating] = useState(initialOverallRating);
  const [crustRating, setCrustRating] = useState(initialCrustRating);
  const [review, setReview] = useState("");

  const handleOverallRatingChange = (rating: number) => {
    setOverallRating(rating);
    onRatingChange(rating, crustRating);
  };

  const handleCrustRatingChange = (rating: number) => {
    setCrustRating(rating);
    onRatingChange(overallRating, rating);
  };

  const handleSubmitReview = () => {
    if (onSubmitReview) {
      onSubmitReview(review);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.ratingSection}>
        <Text style={styles.label}>Overall Rating:</Text>
        <StarRating
          rating={overallRating}
          onRatingChange={handleOverallRatingChange}
          size={30}
        />
        <Text style={styles.helpText}>
          How was the pizza overall? Rate from 1 to 5 stars.
        </Text>
      </View>

      <View style={styles.ratingSection}>
        <Text style={styles.label}>Crust Quality:</Text>
        <StarRating
          rating={crustRating}
          onRatingChange={handleCrustRatingChange}
          size={30}
        />
        <Text style={styles.helpText}>
          How was the quality of the crust specifically? Rate from 1 to 5 stars.
        </Text>
      </View>

      {allowReview && (
        <View style={styles.reviewSection}>
          <Text style={styles.label}>Review (Optional):</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your thoughts about this pizza..."
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitReview}
          >
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratingSection: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  reviewSection: {
    marginTop: SPACING.md,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default DualRatingInput;
