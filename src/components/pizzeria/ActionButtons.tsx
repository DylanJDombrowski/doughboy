// src/components/pizzeria/ActionButtons.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { Pizzeria } from '../../types';

interface ActionButtonsProps {
  pizzeria: Pizzeria;
  isSaved: boolean;
  onToggleSave: () => void;
  onWriteReview: () => void;
  distance?: number | null;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  pizzeria,
  isSaved,
  onToggleSave,
  onWriteReview,
  distance
}) => {
  const handleShare = async () => {
    try {
      const message = `Check out ${pizzeria.name} on Doughboy!\n\n${pizzeria.address}\n\n`;
      await Share.share({
        message,
        title: `${pizzeria.name} on Doughboy`,
      });
    } catch (error) {
      console.error('Error sharing pizzeria:', error);
    }
  };

  const handleGetDirections = () => {
    const { latitude, longitude, address, name } = pizzeria;
    let url = '';

    if (Platform.OS === 'ios') {
      url = `maps:?q=${name}&ll=${latitude},${longitude}`;
    } else {
      // Android
      url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${name})`;
      // Alternative for Google Maps: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${name}`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps in browser
          return Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
          );
        }
      })
      .catch((err) => console.error('Error opening maps:', err));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onToggleSave}
        style={[styles.button, isSaved ? styles.savedButton : {}]}
      >
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={20}
          color={isSaved ? COLORS.white : COLORS.primary}
        />
        <Text style={[styles.buttonText, isSaved ? styles.savedButtonText : {}]}>
          {isSaved ? 'Saved' : 'Save'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onWriteReview} style={styles.button}>
        <Ionicons name="star-outline" size={20} color={COLORS.primary} />
        <Text style={styles.buttonText}>Review</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleShare} style={styles.button}>
        <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
        <Text style={styles.buttonText}>Share</Text>
      </TouchableOpacity>

      {distance !== null && distance !== undefined && (
        <TouchableOpacity onPress={handleGetDirections} style={styles.button}>
          <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
          <Text style={styles.buttonText}>Directions</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
  },
  buttonText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  savedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  savedButtonText: {
    color: COLORS.white,
  },
});

export default ActionButtons;
