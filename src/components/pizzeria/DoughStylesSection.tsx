// src/components/pizzeria/DoughStylesSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, DOUGH_CATEGORIES } from '../../constants';
import { PizzeriaDoughStyle } from '../../types';

interface DoughStylesSectionProps {
  doughStyles: PizzeriaDoughStyle[];
}

const DoughStylesSection: React.FC<DoughStylesSectionProps> = ({ doughStyles }) => {
  // Filter only approved dough styles
  const approvedStyles = doughStyles.filter(style => style.status === 'approved');

  if (approvedStyles.length === 0) {
    return null;
  }

  // Get the full names of dough styles
  const getDoughStyleLabel = (value: string) => {
    const category = DOUGH_CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Specializes in:</Text>
      
      <View style={styles.tagsContainer}>
        {approvedStyles.map((style, index) => (
          <View key={style.id} style={styles.tag}>
            <Text style={styles.tagText}>
              {getDoughStyleLabel(style.dough_style)}
            </Text>
          </View>
        ))}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tagText: {
    color: COLORS.primaryDark,
    fontWeight: '500',
    fontSize: 14,
  }
});

export default DoughStylesSection;
