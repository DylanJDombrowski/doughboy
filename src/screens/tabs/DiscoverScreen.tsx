// src/screens/tabs/DiscoverScreen.tsx - Updated for Pizza Review Platform
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLocation } from "../../contexts/LocationContext";
import { discoverPizzaPlaces } from "../../services/osmPizzaService";
import { DualRatingDisplay } from "../../components/ratings";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants";
import { Pizzeria } from "../../types";

const DiscoverScreen: React.FC = () => {
  const router = useRouter();
  const { location } = useLocation();
  const [pizzerias, setPizzerias] = useState<Pizzeria[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "nearby" | "rated">("nearby");

  useEffect(() => {
    if (location && filter === "nearby") {
      loadNearbyPizzerias();
    }
  }, [location, filter]);

  const loadNearbyPizzerias = async () => {
    if (!location) return;

    try {
      setLoading(true);
      const result = await discoverPizzaPlaces(
        location.coords.latitude,
        location.coords.longitude,
        15 // 15km radius
      );

      if (result.success) {
        setPizzerias(result.pizzerias);
      }
    } catch (error) {
      console.error("Error loading pizzerias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePizzeriaPress = (pizzeria: Pizzeria) => {
    router.push(`/pizzeria/${pizzeria.id}`);
  };

  const filteredPizzerias = pizzerias.filter((pizzeria) => {
    if (searchQuery) {
      return (
        pizzeria.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pizzeria.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

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

        <View style={styles.metaContainer}>
          {item.business_type && (
            <Text style={styles.businessType}>
              {item.business_type.charAt(0).toUpperCase() +
                item.business_type.slice(1)}
            </Text>
          )}

          {(item as any).distance && (
            <Text style={styles.distance}>
              {(item as any).distance.toFixed(1)} mi
            </Text>
          )}
        </View>

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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Pizza</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pizza places..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {(["nearby", "all", "rated"] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === filterOption && styles.filterTextActive,
                ]}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredPizzerias}
        renderItem={renderPizzeria}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadNearbyPizzerias}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                Discovering pizza places...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="pizza-outline"
                size={64}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyText}>No pizza places found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or check your location settings
              </Text>
            </View>
          )
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
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.secondary,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: COLORS.white,
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
    width: 100,
    height: 100,
  },
  placeholderImage: {
    width: 100,
    height: 100,
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
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  businessType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  distance: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl * 2,
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

export default DiscoverScreen;
