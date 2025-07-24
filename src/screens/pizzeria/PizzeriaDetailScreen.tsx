// src/screens/pizzeria/PizzeriaDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Linking
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../services/supabase";
import { Pizzeria } from "../../types";
import { DualRatingDisplay, DualRatingInput } from "../../components/ratings";
import { createOrUpdateRating, getRatingStats } from "../../utils";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

export const PizzeriaDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [pizzeria, setPizzeria] = useState<Pizzeria | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingInput, setShowRatingInput] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPizzeriaDetails(id);
    }
  }, [id]);

  const fetchPizzeriaDetails = async (pizzeriaId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pizzerias")
        .select("*, pizzeria_dough_styles(*)")
        .eq("id", pizzeriaId)
        .single();

      if (error) throw error;

      // Get ratings
      const { success, stats } = await getRatingStats(pizzeriaId);
      
      if (success && stats) {
        setPizzeria({
          ...data,
          average_overall_rating: stats.average_overall_rating,
          average_crust_rating: stats.average_crust_rating,
          rating_count: stats.rating_count
        } as Pizzeria);
      } else {
        setPizzeria(data as Pizzeria);
      }
    } catch (error) {
      console.error("Error fetching pizzeria:", error);
      Alert.alert("Error", "Failed to load pizzeria details");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (overallRating: number, crustRating: number) => {
    if (!user || !pizzeria) return;

    try {
      const { success, error } = await createOrUpdateRating({
        recipe_id: pizzeria.id, // Using recipe_id field for consistency with the database
        user_id: user.id,
        overall_rating: overallRating,
        crust_rating: crustRating,
      });

      if (success) {
        setShowRatingInput(false);
        fetchPizzeriaDetails(pizzeria.id); // Refresh to get updated ratings
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
          <Text style={styles.loadingText}>Loading pizzeria...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pizzeria) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pizzeria not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{pizzeria.name}</Text>
          <Text style={styles.address}>{pizzeria.address}</Text>
          
          <View style={styles.ratingSection}>
            <DualRatingDisplay
              overallRating={pizzeria.average_overall_rating || 0}
              crustRating={pizzeria.average_crust_rating || 0}
              ratingCount={pizzeria.rating_count || 0}
              size={18}
            />
            
            {user && (
              <TouchableOpacity 
                style={styles.rateButton}
                onPress={() => setShowRatingInput(!showRatingInput)}
              >
                <Text style={styles.rateButtonText}>
                  {showRatingInput ? "Cancel" : "Rate This Pizzeria"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {showRatingInput && (
            <View style={styles.ratingInputContainer}>
              <DualRatingInput
                onRatingChange={handleRatingSubmit}
              />
            </View>
          )}
          
          <View style={styles.contactButtons}>
            {pizzeria.phone && (
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Linking.openURL(`tel:${pizzeria.phone}`)}
              >
                <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
            )}
            
            {pizzeria.website && (
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Linking.openURL(pizzeria.website!)}
              >
                <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
                <Text style={styles.contactButtonText}>Website</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => 
                Linking.openURL(
                  `https://maps.google.com/?q=${pizzeria.latitude},${pizzeria.longitude}`
                )
              }
            >
              <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contactButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {pizzeria.pizzeria_dough_styles && pizzeria.pizzeria_dough_styles.length > 0 && (
          <View style={styles.doughStylesSection}>
            <Text style={styles.sectionTitle}>Dough Styles</Text>
            <View style={styles.doughStylesContainer}>
              {pizzeria.pizzeria_dough_styles.map((style, index) => (
                <View key={index} style={styles.doughStyleTag}>
                  <Text style={styles.doughStyleText}>
                    {style.dough_style.replace("_", " ")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Additional content would go here */}
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
    marginBottom: SPACING.xs,
  },
  address: {
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
  contactButtons: {
    flexDirection: "row",
    marginTop: SPACING.lg,
    justifyContent: "space-around",
  },
  contactButton: {
    alignItems: "center",
    padding: SPACING.sm,
  },
  contactButtonText: {
    marginTop: SPACING.xs,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  doughStylesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  doughStylesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  doughStyleTag: {
    backgroundColor: COLORS.primary + "20", // 20% opacity
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  doughStyleText: {
    color: COLORS.primaryDark,
    fontWeight: "500",
    textTransform: "capitalize",
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
});

export default PizzeriaDetailScreen;
