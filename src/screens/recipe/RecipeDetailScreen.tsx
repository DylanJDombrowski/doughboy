// src/screens/recipe/RecipeDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../services/supabase";
import { Recipe } from "../../types";
import { DualRatingDisplay, DualRatingInput } from "../../components/ratings";
import { createOrUpdateRating, getRatingStats } from "../../utils/rating"; // Import from specific file
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

const RecipeDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingInput, setShowRatingInput] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("*, ingredients(*), process_steps(*)")
        .eq("id", recipeId)
        .single();

      if (error) throw error;

      // Get ratings
      const { success, stats } = await getRatingStats(recipeId);

      if (success && stats) {
        setRecipe({
          ...data,
          average_overall_rating: stats.average_overall_rating,
          average_crust_rating: stats.average_crust_rating,
        } as Recipe);
      } else {
        setRecipe(data as Recipe);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
      Alert.alert("Error", "Failed to load recipe details");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (
    overallRating: number,
    crustRating: number
  ) => {
    if (!user || !recipe) return;

    try {
      const { success, error } = await createOrUpdateRating({
        recipe_id: recipe.id,
        user_id: user.id,
        overall_rating: overallRating,
        crust_rating: crustRating,
      });

      if (success) {
        setShowRatingInput(false);
        fetchRecipe(recipe.id); // Refresh to get updated ratings
        Alert.alert("Success", "Your rating has been submitted!");
      } else {
        Alert.alert("Error", error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Failed to submit your rating");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>

          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}

          <View style={styles.ratingSection}>
            <DualRatingDisplay
              overallRating={recipe.average_overall_rating || 0}
              crustRating={recipe.average_crust_rating || 0}
              ratingCount={recipe.ratings?.length || 0}
              size={18}
            />

            {user && (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => setShowRatingInput(!showRatingInput)}
              >
                <Text style={styles.rateButtonText}>
                  {showRatingInput ? "Cancel" : "Rate This Recipe"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showRatingInput && (
            <View style={styles.ratingInputContainer}>
              <DualRatingInput onRatingChange={handleRatingSubmit} />
            </View>
          )}
        </View>

        {/* Recipe content would go here */}
        <Text style={styles.comingSoon}>
          Full recipe details coming soon...
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  ratingSection: {
    marginVertical: SPACING.md,
  },
  rateButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: "flex-start",
  },
  rateButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  ratingInputContainer: {
    marginTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.error,
  },
  comingSoon: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: SPACING.xl,
  },
});

export default RecipeDetailScreen;
