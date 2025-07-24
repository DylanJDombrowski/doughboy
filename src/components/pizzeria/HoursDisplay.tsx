// src/components/pizzeria/HoursDisplay.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

interface HoursDisplayProps {
  hours: any | null;
}

// Expected hours format: { monday: { open: "09:00", close: "22:00" }, tuesday: ... }
// or { monday: { open1: "09:00", close1: "14:00", open2: "17:00", close2: "22:00" }, ... } for split hours

const HoursDisplay: React.FC<HoursDisplayProps> = ({ hours }) => {
  const [expanded, setExpanded] = useState(false);
  const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();

  if (!hours) {
    return null;
  }

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const isOpen = () => {
    const todayHours = hours[today];
    if (!todayHours) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check if the pizzeria is open now (handling both regular and split hours)
    if (todayHours.open && todayHours.close) {
      return currentTime >= todayHours.open && currentTime <= todayHours.close;
    } else if (todayHours.open1 && todayHours.close1) {
      const isOpenFirstShift = currentTime >= todayHours.open1 && currentTime <= todayHours.close1;
      const isOpenSecondShift = todayHours.open2 && todayHours.close2 
        ? currentTime >= todayHours.open2 && currentTime <= todayHours.close2
        : false;
      return isOpenFirstShift || isOpenSecondShift;
    }

    return false;
  };

  const formatTimeRange = (dayHours: any) => {
    if (!dayHours) return 'Closed';
    
    if (dayHours.open && dayHours.close) {
      return `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
    } else if (dayHours.open1 && dayHours.close1) {
      if (dayHours.open2 && dayHours.close2) {
        return `${formatTime(dayHours.open1)} - ${formatTime(dayHours.close1)}, ${formatTime(dayHours.open2)} - ${formatTime(dayHours.close2)}`;
      }
      return `${formatTime(dayHours.open1)} - ${formatTime(dayHours.close1)}`;
    }
    
    return 'Closed';
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hoursNum = parseInt(hours, 10);
      const period = hoursNum >= 12 ? 'PM' : 'AM';
      const hours12 = hoursNum % 12 || 12;
      return `${hours12}:${minutes} ${period}`;
    } catch (error) {
      return time;
    }
  };

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Hours</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isOpen() ? COLORS.success : COLORS.error }]} />
          <Text style={styles.statusText}>{isOpen() ? 'Open now' : 'Closed now'}</Text>
        </View>
      </View>

      <View style={styles.todayContainer}>
        <Text style={styles.dayText}>{formatDay(today)}</Text>
        <Text style={styles.hoursText}>{formatTimeRange(hours[today])}</Text>
      </View>

      {expanded && (
        <View style={styles.allHoursContainer}>
          {daysOfWeek.filter(day => day !== today).map(day => (
            <View key={day} style={styles.hourRow}>
              <Text style={styles.dayText}>{formatDay(day)}</Text>
              <Text style={styles.hoursText}>{formatTimeRange(hours[day])}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.expandButton} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.expandButtonText}>
          {expanded ? 'Show less' : 'Show all hours'}
        </Text>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  todayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  allHoursContainer: {
    marginTop: SPACING.sm,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  dayText: {
    fontSize: 16,
    color: COLORS.text,
  },
  hoursText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expandButtonText: {
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
});

export default HoursDisplay;
