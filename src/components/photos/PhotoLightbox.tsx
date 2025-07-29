// src/components/photos/PhotoLightbox.tsx
import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  PanResponder,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../constants";

interface PhotoLightboxProps {
  visible: boolean;
  photos: string[];
  initialIndex?: number;
  onClose: () => void;
  onShare?: (photoUrl: string) => void;
  onPhotoChange?: (index: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  visible,
  photos,
  initialIndex = 0,
  onClose,
  onShare,
  onPhotoChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe to close (vertical swipe)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes when not zoomed
        return (
          !isZoomed && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isZoomed) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isZoomed) {
          if (
            Math.abs(gestureState.dy) > 100 ||
            Math.abs(gestureState.vy) > 0.5
          ) {
            // Close modal with animation
            Animated.timing(translateY, {
              toValue: gestureState.dy > 0 ? screenHeight : -screenHeight,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              translateY.setValue(0);
              onClose();
            });
          } else {
            // Spring back to center
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        }
      },
    })
  ).current;

  // Handle photo change when scrolling
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffset / screenWidth);

    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < photos.length
    ) {
      setCurrentIndex(newIndex);
      onPhotoChange?.(newIndex);
    }
  };

  // Handle image zoom
  const handleImagePress = () => {
    const newScale = isZoomed ? 1 : 2;
    setIsZoomed(!isZoomed);

    Animated.spring(scaleValue, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
  };

  // Reset zoom when photo changes
  React.useEffect(() => {
    if (isZoomed) {
      setIsZoomed(false);
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [currentIndex]);

  // Update current index when initialIndex changes
  React.useEffect(() => {
    setCurrentIndex(initialIndex);
    // Scroll to the correct photo
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: initialIndex * screenWidth,
        animated: false,
      });
    }
  }, [initialIndex, visible]);

  const handleShare = () => {
    if (onShare && photos[currentIndex]) {
      onShare(photos[currentIndex]);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.counter}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>

          {onShare && (
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Photo Container */}
        <Animated.View
          style={[
            styles.photoContainer,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleImagePress}
                  style={styles.imageContainer}
                >
                  <Animated.View
                    style={[
                      styles.imageWrapper,
                      {
                        transform: [{ scale: scaleValue }],
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Footer - Photo Navigation */}
        {photos.length > 1 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={() => {
                if (currentIndex > 0) {
                  const newIndex = currentIndex - 1;
                  setCurrentIndex(newIndex);
                  scrollViewRef.current?.scrollTo({
                    x: newIndex * screenWidth,
                    animated: true,
                  });
                }
              }}
              disabled={currentIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={currentIndex === 0 ? COLORS.textMuted : COLORS.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === photos.length - 1 && styles.navButtonDisabled,
              ]}
              onPress={() => {
                if (currentIndex < photos.length - 1) {
                  const newIndex = currentIndex + 1;
                  setCurrentIndex(newIndex);
                  scrollViewRef.current?.scrollTo({
                    x: newIndex * screenWidth,
                    animated: true,
                  });
                }
              }}
              disabled={currentIndex === photos.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={
                  currentIndex === photos.length - 1
                    ? COLORS.textMuted
                    : COLORS.white
                }
              />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: COLORS.white,
    transform: [{ scale: 1.2 }],
  },
  photoContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  photoWrapper: {
    width: screenWidth,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  navButtonDisabled: {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});

export default PhotoLightbox;
