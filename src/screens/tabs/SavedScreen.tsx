// src/screens/tabs/SavedScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { getSavedPizzerias } from "../../utils/savedPizzeria";
import { DualRatingDisplay } from "../../components/ratings";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import { Pizzeria } from "../../types";

const SavedScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [savedPizzerias, setSavedPizzerias] = useState<Pizzeria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSavedPizzerias();
    }
  }, [user]);

  const loadSavedPizzerias = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { success, pizzerias } = await getSavedPizzerias(user.id);

      if (success && pizzerias) {
        setSavedPizzerias(pizzerias);
      }
    } catch (error) {
      console.error("Error loading saved pizzerias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePizzeriaPress = (pizzeria: Pizzeria) => {
    router.push(`/pizzeria/${pizzeria.id}`);
  };

  const renderPizzeria = ({ item }: { item: Pizzeria }) => (
    <TouchableOpacity
      style={styles.pizzeriaCard}
      onPress={() => handlePizzeriaPress(item)}
    >
      {item.photos && item.photos.length > 0 ? (
        <Image source={{ uri: item.photos[0] }} style={styles.pizzeriaImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="pizza-outline" size={32} color={COLORS.textLight} />
        </View>
      )}

      <View style={styles.pizzeriaContent}>
        <View style={styles.pizzeriaHeader}>
          <Text style={styles.pizzeriaName}>{item.name}</Text>
          {item.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={COLORS.primary}
            />
          )}
        </View>

        <Text style={styles.pizzeriaAddress} numberOfLines={1}>
          {item.address}
        </Text>

        {item.business_type && (
          <Text style={styles.businessType}>
            {item.business_type.charAt(0).toUpperCase() +
              item.business_type.slice(1)}
          </Text>
        )}

        {((item.average_overall_rating && item.average_overall_rating > 0) ||
          (item.average_crust_rating && item.average_crust_rating > 0)) && (
          <View style={styles.ratingContainer}>
            <DualRatingDisplay
              overallRating={item.average_overall_rating || 0}
              crustRating={item.average_crust_rating || 0}
              compact={true}
              size={14}
              ratingCount={item.rating_count}
            />
          </View>
        )}

        {item.cuisine_styles && item.cuisine_styles.length > 0 && (
          <View style={styles.cuisineContainer}>
            {item.cuisine_styles.slice(0, 2).map((style, index) => (
              <View key={index} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>
                  {style.replace("_", " ")}
                </Text>
              </View>
            ))}
            {item.cuisine_styles.length > 2 && (
              <Text style={styles.moreStyles}>
                +{item.cuisine_styles.length - 2} more
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading saved pizza places...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Places</Text>
        <Text style={styles.subtitle}>{savedPizzerias.length} saved</Text>
      </View>

      <FlatList
        data={savedPizzerias}
        renderItem={renderPizzeria}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadSavedPizzerias}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No saved pizza places yet</Text>
            <Text style={styles.emptySubtext}>
              Start exploring and save your favorite spots!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  list: {
    padding: SPACING.md,
  },
  pizzeriaCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pizzeriaImage: {
    width: 80,
    height: 80,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  pizzeriaContent: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: "space-between",
  },
  pizzeriaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  pizzeriaName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.xs,
  },
  pizzeriaAddress: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  businessType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    marginBottom: SPACING.xs,
  },
  cuisineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  cuisineTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: 2,
  },
  cuisineText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  moreStyles: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  chevronContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
  },
});

export default SavedScreen;
