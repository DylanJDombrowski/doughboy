// src/screens/tabs/MapScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "../../contexts/LocationContext";
import { discoverPizzaPlaces } from "../../services/osmPizzaService";
import { COLORS, SPACING } from "../../constants";
import { Pizzeria } from "../../types";

const MapScreen: React.FC = () => {
  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const [pizzerias, setPizzerias] = useState<Pizzeria[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      loadNearbyPizzerias();
    }
  }, [location]);

  const loadNearbyPizzerias = async () => {
    if (!location) return;

    try {
      setLoading(true);
      const result = await discoverPizzaPlaces(
        location.coords.latitude,
        location.coords.longitude,
        10 // 10km radius
      );

      if (result.success) {
        setPizzerias(result.pizzerias);
      } else {
        Alert.alert("Error", result.error || "Failed to load pizza places");
      }
    } catch (error) {
      console.error("Error loading pizzerias:", error);
      Alert.alert("Error", "Failed to load pizza places");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadNearbyPizzerias();
  };

  if (locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (locationError || !location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="location-outline"
            size={48}
            color={COLORS.textLight}
          />
          <Text style={styles.errorText}>Location access needed</Text>
          <Text style={styles.errorSubtext}>
            Please enable location services to find pizza places near you
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pizza Map</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={loading}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={loading ? COLORS.textLight : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {region && (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {pizzerias.map((pizzeria) => (
            <Marker
              key={pizzeria.id}
              coordinate={{
                latitude: pizzeria.latitude,
                longitude: pizzeria.longitude,
              }}
              title={pizzeria.name}
              description={pizzeria.address}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="pizza" size={24} color={COLORS.primary} />
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingOverlayText}>Finding pizza places...</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {pizzerias.length} pizza places found
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryDark,
  },
  refreshButton: {
    padding: SPACING.sm,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  loadingOverlay: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingOverlayText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
  },
  statsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
  },
});

export default MapScreen;
