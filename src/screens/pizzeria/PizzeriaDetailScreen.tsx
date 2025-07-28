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
  Linking,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "../../contexts/LocationContext";
import { supabase } from "../../services/supabase";
import { Pizzeria, PizzeriaRating } from "../../types";
import { DualRatingDisplay, ReviewModal } from "../../components/ratings";
import {
  createOrUpdatePizzeriaRating,
  getPizzeriaRatingStats,
} from "../../utils";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";

interface RatingBreakdown {
  stars: number;
  percentage: number;
  count: number;
}

interface ReviewWithProfile extends PizzeriaRating {
  profiles?: {
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

export const PizzeriaDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { location } = useLocation();
  const router = useRouter();

  const [pizzeria, setPizzeria] = useState<Pizzeria | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingInput, setShowRatingInput] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [fullScreenPhoto, setFullScreenPhoto] = useState<string | null>(null);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown[]>([]);
  const [pizzeriaPhotos, setPizzeriaPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchPizzeriaDetails(id);
      fetchReviews(id);
      checkIfSaved(id);

      // Fetch photos from reviews for this pizzeria
      const loadPhotos = async () => {
        const photos = await fetchReviewPhotos(id);
        setPizzeriaPhotos(photos);
      };
      loadPhotos();
    }
  }, [id]);

  useEffect(() => {
    if (pizzeria && location) {
      calculateDistance();
    }
  }, [pizzeria, location]);

  const calculateDistance = () => {
    if (!pizzeria || !location) return;

    const R = 3959; // Earth's radius in miles
    const lat1 = location.coords.latitude;
    const lon1 = location.coords.longitude;
    const lat2 = pizzeria.latitude;
    const lon2 = pizzeria.longitude;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setDistance(distance);
  };

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
      const { success, stats } = await getPizzeriaRatingStats(pizzeriaId);

      if (success && stats) {
        setPizzeria({
          ...data,
          average_overall_rating: stats.average_overall_rating,
          average_crust_rating: stats.average_crust_rating,
          rating_count: stats.rating_count,
        } as Pizzeria);

        // Calculate rating breakdown
        calculateRatingBreakdown(pizzeriaId);
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

  const calculateRatingBreakdown = async (pizzeriaId: string) => {
    try {
      const { data: ratings, error } = await supabase
        .from("pizzeria_ratings")
        .select("overall_rating")
        .eq("pizzeria_id", pizzeriaId);

      if (error) throw error;

      if (!ratings || ratings.length === 0) {
        return;
      }

      const totalRatings = ratings.length;
      const breakdown: RatingBreakdown[] = [];

      // Initialize with zeros
      for (let i = 5; i >= 1; i--) {
        breakdown.push({
          stars: i,
          percentage: 0,
          count: 0,
        });
      }

      // Count occurrences of each rating
      ratings.forEach((r) => {
        const rating = Math.round(r.overall_rating);
        if (rating >= 1 && rating <= 5) {
          const index = 5 - rating;
          breakdown[index].count++;
        }
      });

      // Calculate percentages
      breakdown.forEach((b) => {
        b.percentage = (b.count / totalRatings) * 100;
      });

      setRatingBreakdown(breakdown);
    } catch (error) {
      console.error("Error calculating rating breakdown:", error);
    }
  };

  const fetchReviews = async (pizzeriaId: string) => {
    try {
      const { data, error } = await supabase
        .from("pizzeria_ratings")
        .select("*, profiles:user_id(username, avatar_url)")
        .eq("pizzeria_id", pizzeriaId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Transform the data to match our interface - keep all original fields
      const transformedData: ReviewWithProfile[] =
        data?.map((item) => ({
          ...item, // Keep all original fields including null values
          // Add a dummy recipe_id for compatibility (this should be removed from the interface)
          recipe_id: item.pizzeria_id,
          profiles: item.profiles,
        })) || [];

      setReviews(transformedData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const checkIfSaved = async (pizzeriaId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_pizzerias")
        .select("id")
        .eq("pizzeria_id", pizzeriaId)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setIsSaved(!!data);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const toggleSavePizzeria = async () => {
    if (!user || !pizzeria) return;

    try {
      if (isSaved) {
        // Delete saved entry
        const { error } = await supabase
          .from("saved_pizzerias")
          .delete()
          .eq("pizzeria_id", pizzeria.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setIsSaved(false);
        Alert.alert("Success", "Pizzeria removed from your saved list");
      } else {
        // Create saved entry
        const { error } = await supabase.from("saved_pizzerias").insert({
          pizzeria_id: pizzeria.id,
          user_id: user.id,
        });

        if (error) throw error;

        setIsSaved(true);
        Alert.alert("Success", "Pizzeria saved to your list");
      }
    } catch (error) {
      console.error("Error toggling saved status:", error);
      Alert.alert("Error", "Failed to update saved status");
    }
  };

  const handleRatingSubmit = async (
    overallRating: number,
    crustRating: number
  ) => {
    if (!user || !pizzeria) return;

    try {
      const { success, error } = await createOrUpdatePizzeriaRating({
        pizzeria_id: pizzeria.id,
        user_id: user.id,
        overall_rating: overallRating,
        crust_rating: crustRating,
      });

      if (success) {
        setShowRatingInput(false);
        fetchPizzeriaDetails(pizzeria.id); // Refresh to get updated ratings
        fetchReviews(pizzeria.id); // Refresh reviews
        Alert.alert("Success", "Your rating has been submitted!");
      } else {
        Alert.alert("Error", error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Failed to submit your rating");
    }
  };

  const handleReviewSubmitted = async () => {
    if (pizzeria) {
      fetchPizzeriaDetails(pizzeria.id); // Refresh to get updated ratings
      fetchReviews(pizzeria.id); // Refresh reviews

      // Refresh photos
      const photos = await fetchReviewPhotos(pizzeria.id);
      setPizzeriaPhotos(photos);
    }
  };

  // Fetch photos from reviews
  const fetchReviewPhotos = async (pizzeriaId: string) => {
    try {
      const { data, error } = await supabase
        .from("pizzeria_ratings")
        .select("photos")
        .eq("pizzeria_id", pizzeriaId)
        .not("photos", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Flatten all photo arrays into a single array
      const allPhotos = data
        ?.filter((item) => item.photos && item.photos.length > 0)
        .flatMap((item) => item.photos || []);

      // Return unique photos (remove duplicates)
      return [...new Set(allPhotos)];
    } catch (error) {
      console.error("Error fetching review photos:", error);
      return [];
    }
  };

  const voteDoughStyle = async (styleId: string, voteUp: boolean) => {
    if (!user || !pizzeria) return;

    try {
      // First get the current vote counts
      const { data: currentStyle, error: fetchError } = await supabase
        .from("pizzeria_dough_styles")
        .select("votes_up, votes_down")
        .eq("id", styleId)
        .single();

      if (fetchError) throw fetchError;

      const newVotesUp = voteUp
        ? (currentStyle.votes_up || 0) + 1
        : currentStyle.votes_up;
      const newVotesDown = !voteUp
        ? (currentStyle.votes_down || 0) + 1
        : currentStyle.votes_down;

      const { error } = await supabase
        .from("pizzeria_dough_styles")
        .update({
          votes_up: newVotesUp,
          votes_down: newVotesDown,
        })
        .eq("id", styleId);

      if (error) throw error;

      // Refresh pizzeria details
      fetchPizzeriaDetails(pizzeria.id);
      Alert.alert("Thanks!", "Your vote has been recorded");
    } catch (error) {
      console.error("Error voting on dough style:", error);
      Alert.alert("Error", "Failed to record your vote");
    }
  };

  const sharePizzeria = () => {
    if (!pizzeria) return;

    const shareText =
      `Check out ${pizzeria.name} on Doughboy! ` +
      `Overall rating: ${pizzeria.average_overall_rating?.toFixed(1)}/5, ` +
      `Crust rating: ${pizzeria.average_crust_rating?.toFixed(1)}/5. ` +
      `https://doughboy.app/pizzeria/${pizzeria.id}`;

    try {
      if (navigator.share) {
        navigator.share({
          title: pizzeria.name,
          text: shareText,
          url: `https://doughboy.app/pizzeria/${pizzeria.id}`,
        });
      } else {
        // Fallback if Web Share API is not available
        Linking.openURL(
          `mailto:?subject=Check out ${pizzeria.name}&body=${shareText}`
        );
      }
    } catch (error) {
      console.error("Error sharing pizzeria:", error);
      Alert.alert("Error", "Failed to share pizzeria");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading pizzeria...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pizzeria) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>Pizzeria not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{pizzeria.name}</Text>
            {pizzeria.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.address}>{pizzeria.address}</Text>

          {distance !== null && (
            <Text style={styles.distance}>
              {distance.toFixed(1)} miles from your location
            </Text>
          )}

          {/* Rating Summary Section */}
          <View style={styles.ratingSummary}>
            <DualRatingDisplay
              overallRating={pizzeria.average_overall_rating || 0}
              crustRating={pizzeria.average_crust_rating || 0}
              ratingCount={pizzeria.rating_count || 0}
              size={24}
            />

            {/* Rating Breakdown */}
            {ratingBreakdown.length > 0 && (
              <View style={styles.ratingBreakdown}>
                {ratingBreakdown.map((item) => (
                  <View
                    key={`rating-${item.stars}`}
                    style={styles.breakdownRow}
                  >
                    <Text style={styles.breakdownLabel}>{item.stars} ★</Text>
                    <View style={styles.breakdownBarContainer}>
                      <View
                        style={[
                          styles.breakdownBar,
                          { width: `${item.percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.breakdownPercentage}>
                      {Math.round(item.percentage)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {user && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowReviewModal(true)}
              >
                <Ionicons name="star" size={22} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Review</Text>
              </TouchableOpacity>
            )}

            {user && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isSaved ? styles.savedButton : null,
                ]}
                onPress={toggleSavePizzeria}
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={COLORS.white}
                />
                <Text style={styles.actionButtonText}>
                  {isSaved ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={sharePizzeria}
            >
              <Ionicons
                name="share-social-outline"
                size={22}
                color={COLORS.white}
              />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Linking.openURL(
                  `https://maps.google.com/?q=${pizzeria.latitude},${pizzeria.longitude}`
                )
              }
            >
              <Ionicons
                name="navigate-outline"
                size={22}
                color={COLORS.white}
              />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Buttons */}
        <View style={styles.contactButtons}>
          {pizzeria.phone && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL(`tel:${pizzeria.phone}`)}
            >
              <Ionicons name="call-outline" size={24} color={COLORS.primary} />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          )}

          {pizzeria.website && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL(pizzeria.website!)}
            >
              <Ionicons name="globe-outline" size={24} color={COLORS.primary} />
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
            <Ionicons name="map-outline" size={24} color={COLORS.primary} />
            <Text style={styles.contactButtonText}>Map</Text>
          </TouchableOpacity>
        </View>

        {/* Dough Styles Section */}
        {pizzeria.pizzeria_dough_styles &&
          pizzeria.pizzeria_dough_styles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specializes in</Text>
              <View style={styles.doughStylesContainer}>
                {pizzeria.pizzeria_dough_styles.map((style) => (
                  <View key={style.id} style={styles.doughStyleCard}>
                    <Text style={styles.doughStyleText}>
                      {style.dough_style.replace(/_/g, " ")}
                    </Text>
                    <View style={styles.voteButtons}>
                      <TouchableOpacity
                        style={styles.voteButton}
                        onPress={() => voteDoughStyle(style.id, true)}
                      >
                        <Ionicons
                          name="thumbs-up-outline"
                          size={18}
                          color={COLORS.primary}
                        />
                        <Text style={styles.voteCount}>
                          {style.votes_up || 0}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.voteButton}
                        onPress={() => voteDoughStyle(style.id, false)}
                      >
                        <Ionicons
                          name="thumbs-down-outline"
                          size={18}
                          color={COLORS.error}
                        />
                        <Text style={styles.voteCount}>
                          {style.votes_down || 0}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Photos Gallery Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {pizzeriaPhotos.length > 0 ? (
            <View style={styles.photoGallery}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {pizzeriaPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={`photo-${index}`}
                    onPress={() => setFullScreenPhoto(photo)}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.galleryPhoto}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.emptyPhotos}>
              <Ionicons
                name="images-outline"
                size={48}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyPhotosText}>No photos yet</Text>
              <Text style={styles.emptyPhotosSubtext}>
                Be the first to add photos by submitting a review!
              </Text>
            </View>
          )}
        </View>

        {/* Recent Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Image
                        source={{
                          uri:
                            review.profiles?.avatar_url ||
                            "https://ui-avatars.com/api/?name=User&background=random",
                        }}
                        style={styles.reviewerAvatar}
                      />
                      <Text style={styles.reviewerName}>
                        {review.profiles?.username || "Anonymous"}
                      </Text>
                    </View>
                    <DualRatingDisplay
                      overallRating={review.overall_rating}
                      crustRating={review.crust_rating}
                      compact={true}
                      size={14}
                    />
                  </View>

                  {review.review && (
                    <Text style={styles.reviewText}>{review.review}</Text>
                  )}

                  {review.photos && review.photos.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.reviewPhotoScroll}
                    >
                      {review.photos.map((photo, index) => (
                        <TouchableOpacity
                          key={`review-photo-${index}`}
                          onPress={() => setFullScreenPhoto(photo)}
                        >
                          <Image
                            source={{ uri: photo }}
                            style={styles.reviewPhoto}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyReviews}>
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyReviewsText}>No reviews yet</Text>
              <Text style={styles.emptyReviewsSubtext}>
                Be the first to review this pizzeria!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Full Screen Photo Modal */}
      <Modal
        visible={!!fullScreenPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenPhoto(null)}
      >
        <View style={styles.photoModal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullScreenPhoto(null)}
          >
            <Ionicons name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>

          {fullScreenPhoto && (
            <Image
              source={{ uri: fullScreenPhoto }}
              style={styles.fullScreenPhoto}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Review Modal */}
      {pizzeria && (
        <ReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          recipeId={pizzeria.id}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    flex: 1,
  },
  address: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  distance: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF5020",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.round,
    marginLeft: SPACING.sm,
  },
  verifiedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    marginLeft: SPACING.xs / 2,
  },
  ratingSummary: {
    marginVertical: SPACING.md,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingSection: {
    marginVertical: SPACING.md,
  },
  ratingBreakdown: {
    marginTop: SPACING.md,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  breakdownLabel: {
    width: 40,
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  breakdownBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: SPACING.sm,
    overflow: "hidden",
  },
  breakdownBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  breakdownPercentage: {
    width: 36,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: SPACING.md,
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.md,
  },
  savedButton: {
    backgroundColor: "#4CAF50",
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 12,
    marginTop: SPACING.xs / 2,
  },
  contactButtons: {
    flexDirection: "row",
    marginVertical: SPACING.md,
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  section: {
    marginBottom: SPACING.lg,
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  seeAllButton: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  doughStylesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  doughStyleCard: {
    backgroundColor: COLORS.primary + "15", // 15% opacity
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 150,
    marginBottom: SPACING.sm,
  },
  doughStyleText: {
    color: COLORS.primaryDark,
    fontWeight: "500",
    textTransform: "capitalize",
    fontSize: 14,
  },
  voteButtons: {
    flexDirection: "row",
    marginTop: SPACING.sm,
    justifyContent: "flex-start",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  voteCount: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: SPACING.xs / 2,
  },
  photoGallery: {
    marginTop: SPACING.sm,
  },
  galleryPhoto: {
    width: 140,
    height: 140,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  reviewsList: {
    marginTop: SPACING.sm,
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: SPACING.md,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  reviewPhotoScroll: {
    marginVertical: SPACING.sm,
  },
  reviewPhoto: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  emptyReviews: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
  },
  emptyReviewsText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  emptyPhotos: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
  },
  emptyPhotosText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  emptyPhotosSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  photoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenPhoto: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  backButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: SPACING.md,
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
    marginTop: SPACING.sm,
  },
});

export default PizzeriaDetailScreen;
