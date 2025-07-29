// app.config.js - Fixed to match your app.json structure
export default {
  expo: {
    name: "Doughboy",
    slug: "doughboy",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png", // Match app.json path
    scheme: "doughboy", // Add scheme to fix Linking warning
    userInterfaceStyle: "automatic", // Match app.json
    newArchEnabled: true, // Match app.json
    splash: {
      image: "./assets/images/splash-icon.png", // Match app.json path
      resizeMode: "contain",
      backgroundColor: "#ffffff", // Match app.json
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourname.doughboy",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "This app uses location to find pizza places near you.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "This app uses location to find pizza places near you.",
        NSCameraUsageDescription:
          "This app uses the camera to take photos of your pizza experiences.",
        NSPhotoLibraryUsageDescription:
          "This app accesses your photo library to share your pizza photos.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png", // Match app.json path
        backgroundColor: "#ffffff", // Match app.json
      },
      package: "com.yourname.doughboy",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
      ],
      edgeToEdgeEnabled: true, // Match app.json
    },
    web: {
      bundler: "metro", // Match app.json
      output: "static", // Match app.json
      favicon: "./assets/images/favicon.png", // Match app.json path
    },
    plugins: [
      "expo-router", // Match app.json
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png", // Use existing icon path
          color: "#D4A574",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow Doughboy to use your location to find nearby pizza places.",
          locationWhenInUsePermission:
            "Allow Doughboy to use your location to find nearby pizza places.",
        },
      ],
      "expo-apple-authentication",
    ],
    experiments: {
      typedRoutes: true, // Match app.json
    },
    extra: {
      eas: {
        projectId: "your-eas-project-id",
      },
    },
  },
};
