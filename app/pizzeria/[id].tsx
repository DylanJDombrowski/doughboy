// app/pizzeria/[id].tsx - Fixed version
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Alert,
  StatusBar,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/hooks/useAuth";
import { useLocation } from "../../src/contexts/LocationContext";
import { COLORS, SPACING, BORDER_RADIUS } from "../../src/constants";
import { checkAndAwardAchievements } from "../../src/services/achievementService";
import { AchievementModal } from "../../src/components/achievements";
import { UserAchievement, AchievementType } from "../../src/types";
import {
  PizzeriaHeader,
  DoughStylesSection,
  PizzeriaReviewsList,
  ActionButtons,
  HoursDisplay,
} from "../../src/components/pizzeria";
import { DualRatingDisplay, ReviewModal } from "../../src/components/ratings";
import { PhotoGallery } from "../../src/components/photos";
import {
  fetchPizzeriaDetails,
  fetchPizzeriaReviews,
  isPizzeriaSaved,
  savePizzeria,
  unsavePizzeria,
} from "../../src/services/pizzeria";
import { PizzeriaWithRatings, PizzeriaRating } from "../../src/types";
import { supabase } from "../../src/services/supabase";

export default function PizzeriaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { location } = useLocation();
  const router = useRouter();

  const [pizzeria, setPizzeria] = useState<PizzeriaWithRatings | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<PizzeriaRating[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [fullScreenPhoto, setFullScreenPhoto] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratingStats, setRatingStats] = useState<{
    total_ratings: number;
    avg_overall_rating: number;
    avg_crust_rating: number;
    five_star_count: number;
    four_star_count: number;
    three_star_count: number;
    two_star_count: number;
    one_star_count: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  // Fixed: Changed from AchievementType to UserAchievement
  const [newAchievement, setNewAchievement] = useState<UserAchievement | null>(
    null
  );

  useEffect(() => {
    if (id) {
      loadPizzeriaData();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkIfSaved();
    }
  }, [user, id]);

  useEffect(() => {
    if (pizzeria && location) {
      calculateDistance();
    }
  }, [pizzeria, location]);

  const loadPizzeriaData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      if (!id) return;

      // Fetch pizzeria details with ratings summary
      const {
        success,
        pizzeria: pizzeriaData,
        ratingStats: stats,
        error,
      } = await fetchPizzeriaDetails(id);

      if (!success || !pizzeriaData) {
        throw new Error(error || "Failed to load pizzeria details");
      }

      setPizzeria(pizzeriaData);
      if (stats) {
        setRatingStats(stats);
      }

      // Fetch recent reviews
      const { success: reviewSuccess, reviews: reviewsData } =
        await fetchPizzeriaReviews(id);
      if (reviewSuccess && reviewsData) {
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Error loading pizzeria data:", error);
      Alert.alert(
        "Error",
        "Failed to load pizzeria details. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  const checkIfSaved = async () => {
    if (!user || !id) return;

    try {
      const {
        success,
        isSaved: saved,
        error,
      } = await isPizzeriaSaved(user.id, id);
      if (success) {
        setIsSaved(!!saved);
      }
    } catch (error) {
      console.error("Error checking if pizzeria is saved:", error);
    }
  };

  const handleToggleSave = async () => {
    if (!user || !id) {
      Alert.alert("Sign In Required", "Please sign in to save pizzerias.");
      return;
    }

    try {
      if (isSaved) {
        const { success } = await unsavePizzeria(user.id, id);
        if (success) {
          setIsSaved(false);
        }
      } else {
        const { success } = await savePizzeria(user.id, id);
        if (success) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Error toggling saved state:", error);
      Alert.alert("Error", "Failed to update saved status. Please try again.");
    }
  };

  const handleRefresh = () => {
    loadPizzeriaData(true);
  };

  const handleWriteReview = () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to write a review.");
      return;
    }
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (
    overallRating: number,
    crustRating: number,
    review: string,
    photos: string[]
  ) => {
    if (!user || !pizzeria) return;

    try {
      // Use the createOrUpdatePizzeriaRating function from the util
      const { data, error } = await supabase
        .from("pizzeria_ratings")
        .upsert({
          pizzeria_id: pizzeria.id,
          user_id: user.id,
          overall_rating: overallRating,
          crust_rating: crustRating,
          review,
          photos,
        })
        .select()
        .single();

      if (error) throw error;

      // Check for new achievements
      const achievementResult = await checkAndAwardAchievements(user.id);
      if (
        achievementResult.success &&
        achievementResult.newAchievements &&
        achievementResult.newAchievements.length > 0
      ) {
        // Show the first new achievement
        setNewAchievement(achievementResult.newAchievements[0]);
        setShowAchievementModal(true);
      }

      // Refresh the data to show the new review
      loadPizzeriaData();
      setShowReviewModal(false);

      // Show success message
      Alert.alert("Success", "Your review has been submitted!");
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  const handleLoadMoreReviews = () => {
    router.push(`/pizzeria/${id}/reviews`);
  };

  const handlePhotoPress = (photoUrl: string) => {
    setFullScreenPhoto(photoUrl);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading pizzeria details...</Text>
      </View>
    );
  }

  // Error state
  if (!pizzeria) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Could not load pizzeria details</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadPizzeriaData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate rating breakdown percentages
  const getRatingBreakdown = () => {
    if (!ratingStats || ratingStats.total_ratings === 0) return [];

    const total = ratingStats.total_ratings;
    return [
      {
        stars: 5,
        count: ratingStats.five_star_count,
        percentage: (ratingStats.five_star_count / total) * 100,
      },
      {
        stars: 4,
        count: ratingStats.four_star_count,
        percentage: (ratingStats.four_star_count / total) * 100,
      },
      {
        stars: 3,
        count: ratingStats.three_star_count,
        percentage: (ratingStats.three_star_count / total) * 100,
      },
      {
        stars: 2,
        count: ratingStats.two_star_count,
        percentage: (ratingStats.two_star_count / total) * 100,
      },
      {
        stars: 1,
        count: ratingStats.one_star_count,
        percentage: (ratingStats.one_star_count / total) * 100,
      },
    ];
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: pizzeria?.name || "Pizzeria",
          headerTransparent: !!pizzeria?.photos?.length,
          headerBackTitle: "Back",
          headerTintColor: pizzeria?.photos?.length
            ? COLORS.white
            : COLORS.primary,
          headerStyle: {
            backgroundColor: pizzeria?.photos?.length
              ? "transparent"
              : COLORS.white,
          },
        }}
      />

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Image or Image Carousel */}
          {pizzeria.photos && pizzeria.photos.length > 0 ? (
            <PhotoGallery
              photos={pizzeria.photos}
              columns={1}
              maxPhotos={5}
              onPhotoPress={handlePhotoPress}
              enableLightbox={true}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="pizza-outline" size={64} color={COLORS.primary} />
              <Text style={styles.placeholderText}>No photos available</Text>
            </View>
          )}

          <View style={styles.contentContainer}>
            {/* Pizzeria Header - Fixed: Convert verified to boolean */}
            <PizzeriaHeader
              name={pizzeria.name}
              address={pizzeria.address}
              verified={!!pizzeria.verified} // Convert boolean | null to boolean
              distance={distance}
              phone={pizzeria.phone || null}
              website={pizzeria.website || null}
            />

            {/* Action Buttons */}
            <ActionButtons
              pizzeria={pizzeria}
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              onWriteReview={handleWriteReview}
              distance={distance}
            />

            {/* Ratings */}
            <View style={styles.ratingContainer}>
              <Text style={styles.sectionTitle}>Ratings</Text>

              <DualRatingDisplay
                overallRating={pizzeria.average_overall_rating || 0}
                crustRating={pizzeria.average_crust_rating || 0}
                showLabels={true}
                showValues={true}
                size={20}
                ratingCount={pizzeria.total_ratings || 0}
              />

              {/* Rating Breakdown */}
              {ratingStats && ratingStats.total_ratings > 0 && (
                <View style={styles.breakdownContainer}>
                  {getRatingBreakdown().map(({ stars, count, percentage }) => (
                    <View
                      key={`breakdown-${stars}`}
                      style={styles.breakdownRow}
                    >
                      <Text style={styles.breakdownStars}>
                        {stars}{" "}
                        <Ionicons
                          name="star"
                          size={14}
                          color={COLORS.primary}
                        />
                      </Text>
                      <View style={styles.breakdownBarContainer}>
                        <View
                          style={[
                            styles.breakdownBar,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.breakdownCount}>{count}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Dough Styles */}
            {pizzeria.pizzeria_dough_styles &&
              pizzeria.pizzeria_dough_styles.length > 0 && (
                <DoughStylesSection
                  doughStyles={pizzeria.pizzeria_dough_styles}
                />
              )}

            {/* Hours */}
            {pizzeria.hours && <HoursDisplay hours={pizzeria.hours} />}

            {/* Description */}
            {pizzeria.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{pizzeria.description}</Text>
              </View>
            )}

            {/* Reviews */}
            <PizzeriaReviewsList
              reviews={reviews}
              onLoadMore={handleLoadMoreReviews}
              onPhotoPress={handlePhotoPress}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Full Screen Photo Modal */}
      <Modal
        visible={fullScreenPhoto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenPhoto(null)}
      >
        <SafeAreaView style={styles.photoModalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullScreenPhoto(null)}
          >
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {fullScreenPhoto && (
            <Image
              source={{ uri: fullScreenPhoto }}
              style={styles.fullScreenPhoto}
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          recipeId={pizzeria.id}
          onReviewSubmitted={() => {
            setShowReviewModal(false);
            loadPizzeriaData(); // Refresh data after review submission
            Alert.alert("Success", "Your review has been submitted!");
          }}
        />
      )}

      {/* Achievement Modal */}
      {showAchievementModal && newAchievement && (
        <AchievementModal
          visible={showAchievementModal}
          achievement={newAchievement}
          onClose={() => {
            setShowAchievementModal(false);
            setNewAchievement(null);
          }}
          onShare={() => {
            // TODO: Implement sharing functionality
            console.log("Sharing achievement:", newAchievement);
          }}
        />
      )}