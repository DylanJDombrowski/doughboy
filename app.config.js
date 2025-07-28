// app.config.js
export default {
  expo: {
    name: "Doughboy",
    slug: "doughboy",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#D4A574",
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
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#D4A574",
      },
      package: "com.yourname.doughboy",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
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
    extra: {
      eas: {
        projectId: "your-eas-project-id",
      },
    },
  },
};
