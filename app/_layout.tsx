// app/_layout.tsx - Updated with ToastProvider
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, Alert } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "../src/contexts/AuthContext";
import { LocationProvider } from "../src/contexts/LocationContext";
import { ToastProvider } from "../src/contexts/ToastContext";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function setupApp() {
      try {
        // Request permissions
        const { status: locationStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (locationStatus !== "granted") {
          Alert.alert(
            "Location Permission",
            "Location access is needed to find pizza places near you.",
            [{ text: "OK" }]
          );
        }

        // Request notification permissions
        const { status: notificationStatus } =
          await Notifications.requestPermissionsAsync();

        if (notificationStatus !== "granted") {
          Alert.alert(
            "Notification Permission",
            "Notifications help keep you updated on new pizza places.",
            [{ text: "OK" }]
          );
        }

        setAppReady(true);
      } catch (error) {
        console.error("App setup error:", error);
        setAppReady(true);
      }
    }

    if (fontsLoaded) {
      setupApp();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded && appReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appReady]);

  if (!fontsLoaded || !appReady) {
    return null;
  }

  return (
    <AuthProvider>
      <LocationProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth" />
            <Stack.Screen
              name="pizzeria/[id]"
              options={{ presentation: "modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ToastProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
