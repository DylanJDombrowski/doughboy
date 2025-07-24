// src/screens/tabs/NearMeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "../../contexts/LocationContext";
import { supabase } from "../../services/supabase";
import { DualRatingDisplay } from "../../components/ratings";
import { COLORS, SPACING } from "../../constants";
import { Pizzeria } from "../../types";

interface PizzeriaWithDistance extends Pizzeria {
  distance: number;
  pizzeria_dough_styles?: Pizzeria["pizzeria_dough_styles"];
  average_overall_rating?: number; // renamed from average_rating
  average_crust_rating?: number;
  rating_count?: number;
}

const NearMeScreen: React.FC = () => {
  const {
    location,
    address,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const [pizzerias, setPizzerias] = useState<PizzeriaWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  useEffect(() => {
    if (location) {
      fetchNearbyPizzerias();
    }
  }, [location]);

  const fetchNearbyPizzerias = async () => {
    if (!location) return;

    try {
      setLoading(true);

      // Get pizzerias first
      const { data: pizzerias, error: pizzeriasError } = await supabase
        .from("pizzerias")
        .select("*");

      if (pizzeriasError) throw pizzeriasError;

      if (pizzerias && pizzerias.length > 0) {
        // Get dough styles separately
        const pizzeriaIds = pizzerias.map((p) => p.id);
        const { data: doughStyles } = await supabase
          .from("pizzeria_dough_styles")
          .select("*")
          .in("pizzeria_id", pizzeriaIds)
          .eq("status", "approved");

        // Get ratings for each pizzeria
        const { data: ratings } = await supabase
          .from("recipe_ratings")
          .select("*")
          .in("recipe_id", pizzeriaIds);

        // Combine data and calculate average ratings
        const pizzeriasWithStyles = pizzerias.map((pizzeria) => {
          const pizzeriaRatings = ratings?.filter(r => r.recipe_id === pizzeria.id) || [];
          const ratingCount = pizzeriaRatings.length;
          
          // Calculate average ratings if ratings exist
          const average_overall_rating = ratingCount > 0 
            ? pizzeriaRatings.reduce((sum, r) => sum + r.overall_rating, 0) / ratingCount 
            : 0;
            
          const average_crust_rating = ratingCount > 0 
            ? pizzeriaRatings.reduce((sum, r) => sum + (r.crust_rating || 0), 0) / ratingCount 
            : 0;

          return {
            ...pizzeria,
            pizzeria_dough_styles:
              doughStyles?.filter((style) => style.pizzeria_id === pizzeria.id) ||
              [],
            average_overall_rating,
            average_crust_rating,
            rating_count: ratingCount
          };
        });

        // Calculate distances and filter
        const pizzeriasWithDistance = pizzeriasWithStyles
          .map((pizzeria) => {
            const distance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              pizzeria.latitude,
              pizzeria.longitude
            );
            return { ...pizzeria, distance };
          })
          .filter((p) => p.distance <= 25)
          .sort((a, b) => a.distance - b.distance);

        setPizzerias(pizzeriasWithDistance);
      } else {
        setPizzerias([]);
      }
    } catch (error) {
      console.error("Error fetching pizzerias:", error);
      Alert.alert("Error", "Failed to load nearby pizzerias");
      setPizzerias([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const renderPizzeria = ({ item }: { item: PizzeriaWithDistance }) => (
    <TouchableOpacity style={styles.pizzeriaCard}>
      <View style={styles.pizzeriaHeader}>
        <View style={styles.pizzeriaInfo}>
          <Text style={styles.pizzeriaName}>{item.name}</Text>
          <Text style={styles.pizzeriaAddress}>{item.address}</Text>
          <Text style={styles.pizzeriaDistance}>
            {item.distance.toFixed(1)} miles away
          </Text>
          
          {/* Add dual rating display */}
          {((item.average_overall_rating && item.average_overall_rating > 0) || 
             (item.average_crust_rating && item.average_crust_rating > 0)) && (
            <View style={styles.ratingWrapper}>
              <DualRatingDisplay
                overallRating={item.average_overall_rating || 0}
                crustRating={item.average_crust_rating || 0}
                compact={true}
                ratingCount={item.rating_count}
              />
            </View>
          )}
        </View>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {item.pizzeria_dough_styles && item.pizzeria_dough_styles.length > 0 && (
        <View>
          <Text style={styles.doughStylesLabel}>Dough Styles:</Text>
          <View style={styles.doughStylesContainer}>
            {item.pizzeria_dough_styles.map((style, index) => (
              <View key={index} style={styles.doughStyleTag}>
                <Text style={styles.doughStyleText}>
                  {style.dough_style.replace("_", " ")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={48} color="#666" />
          <Text style={styles.errorText}>Location access needed</Text>
          <Text style={styles.errorSubtext}>
            Please enable location services to find pizzerias near you
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationLoading || !location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Near Me</Text>
        <Text style={styles.subtitle}>{address}</Text>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "map" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("map")}
          >
            <Ionicons
              name="map"
              size={20}
              color={viewMode === "map" ? "#FFF" : "#666"}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === "map" && styles.toggleTextActive,
              ]}
            >
              Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "list" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === "list" ? "#FFF" : "#666"}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === "list" && styles.toggleTextActive,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "map" ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
        >
          {pizzerias.map((pizzeria) => (
            <Marker
              key={pizzeria.id}
              coordinate={{
                latitude: pizzeria.latitude,
                longitude: pizzeria.longitude,
              }}
              title={pizzeria.name}
              description={`${pizzeria.distance.toFixed(1)} miles away`}
            />
          ))}
        </MapView>
      ) : (
        <FlatList
          style={styles.list}
          data={pizzerias}
          renderItem={renderPizzeria}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading pizzerias...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="pizza-outline" size={48} color="#666" />
                <Text style={styles.emptyText}>No pizzerias found nearby</Text>
                <Text style={styles.emptySubtext}>
                  Try expanding your search or try a different location
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  map: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  pizzeriaCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pizzeriaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pizzeriaInfo: {
    flex: 1,
  },
  pizzeriaName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  pizzeriaAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  pizzeriaDistance: {
    fontSize: 12,
    color: "#666",
  },
  ratingWrapper: {
    marginTop: SPACING.xs,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  doughStylesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  doughStylesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  doughStyleTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  doughStyleText: {
    fontSize: 12,
    color: "#666",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 16,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  toggleTextActive: {
    color: "#FFF",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default NearMeScreen;
