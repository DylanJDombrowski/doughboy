// src/components/pizzeria/PizzeriaHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

interface PizzeriaHeaderProps {
  name: string;
  address: string;
  verified: boolean;
  distance?: number | null;
  phone?: string | null;
  website?: string | null;
}

const PizzeriaHeader: React.FC<PizzeriaHeaderProps> = ({
  name,
  address,
  verified,
  distance,
  phone,
  website,
}) => {
  const handleCall = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWebsite = () => {
    if (website) {
      Linking.openURL(website.startsWith('http') ? website : `https://${website}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{name}</Text>
        {verified && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} style={styles.verifiedIcon} />
        )}
      </View>
      
      <View style={styles.addressContainer}>
        <Ionicons name="location" size={18} color={COLORS.text} style={styles.icon} />
        <Text style={styles.address}>{address}</Text>
      </View>
      
      {distance !== null && distance !== undefined && (
        <Text style={styles.distance}>{distance.toFixed(1)} miles away</Text>
      )}
      
      <View style={styles.actionsContainer}>
        {phone && (
          <TouchableOpacity onPress={handleCall} style={styles.actionButton}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
        )}
        
        {website && (
          <TouchableOpacity onPress={handleWebsite} style={styles.actionButton}>
            <Ionicons name="globe" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: SPACING.sm,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  address: {
    fontSize: 16,
    color: COLORS.textLight,
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.md,
  },
  actionText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default PizzeriaHeader;
