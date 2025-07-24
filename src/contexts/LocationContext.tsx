// src/contexts/LocationContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";

interface LocationContextType {
  location: Location.LocationObject | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
  setManualLocation: (lat: number, lng: number, address: string) => void;
  useManualLocation: boolean;
  manualAddress: string | null;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  address: null,
  loading: true,
  error: null,
  refreshLocation: async () => {},
  setManualLocation: () => {},
  useManualLocation: false,
  manualAddress: null,
});

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualAddress, setManualAddressState] = useState<string | null>(null);
  const [manualLocation, setManualLocationState] =
    useState<Location.LocationObject | null>(null);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      // Reverse geocode to get address
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          const formattedAddress = `${addr.name || addr.street || ""} ${
            addr.city || ""
          }, ${addr.region || ""} ${addr.postalCode || ""}`.trim();
          setAddress(formattedAddress);
        }
      } catch (geocodeError) {
        console.warn("Reverse geocoding failed:", geocodeError);
      }
    } catch (err) {
      console.error("Error getting location:", err);
      setError("Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    if (!useManualLocation) {
      await getCurrentLocation();
    }
  };

  const setManualLocation = (lat: number, lng: number, address: string) => {
    const manualLoc: Location.LocationObject = {
      coords: {
        latitude: lat,
        longitude: lng,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    setManualLocationState(manualLoc);
    setManualAddressState(address);
    setUseManualLocation(true);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const contextValue = {
    location: useManualLocation ? manualLocation : location,
    address: useManualLocation ? manualAddress : address,
    loading,
    error,
    refreshLocation,
    setManualLocation,
    useManualLocation,
    manualAddress,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};
