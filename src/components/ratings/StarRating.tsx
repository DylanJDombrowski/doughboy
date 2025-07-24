// src/components/ratings/StarRating.tsx
import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../constants";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
  starColor?: string;
  emptyStarColor?: string;
  containerStyle?: ViewStyle;
  showValue?: boolean;
  valueStyle?: TextStyle;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  readOnly = false,
  onRatingChange,
  starColor = COLORS.primary,
  emptyStarColor = COLORS.textMuted,
  containerStyle,
  showValue = false,
  valueStyle,
}) => {
  const handlePress = (selectedRating: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isHalfFilled = !isFilled && starValue <= rating + 0.5;

          return (
            <TouchableOpacity
              key={index}
              style={styles.star}
              disabled={readOnly}
              onPress={() => handlePress(starValue)}
            >
              <Ionicons
                name={
                  isFilled
                    ? "star"
                    : isHalfFilled
                    ? "star-half"
                    : "star-outline"
                }
                size={size}
                color={isFilled || isHalfFilled ? starColor : emptyStarColor}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      
      {showValue && (
        <Text style={[styles.ratingValue, valueStyle]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
  },
  star: {
    marginRight: SPACING.xs,
  },
  ratingValue: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
});

export default StarRating;
