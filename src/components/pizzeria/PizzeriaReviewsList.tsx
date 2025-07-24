// src/components/pizzeria/PizzeriaReviewsList.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { PizzeriaRating } from '../../types';
import { DualRatingDisplay } from '../ratings';

interface PizzeriaReviewsListProps {
  reviews: PizzeriaRating[];
  onLoadMore?: () => void;
  onPhotoPress?: (photoUrl: string) => void;
}

const PizzeriaReviewsList: React.FC<PizzeriaReviewsListProps> = ({ 
  reviews, 
  onLoadMore,
  onPhotoPress 
}) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reviews yet</Text>
        <Text style={styles.emptySubtext}>Be the first to review this pizzeria!</Text>
      </View>
    );
  }

  const toggleReviewExpanded = (reviewId: string) => {
    const newSet = new Set(expandedReviews);
    if (newSet.has(reviewId)) {
      newSet.delete(reviewId);
    } else {
      newSet.add(reviewId);
    }
    setExpandedReviews(newSet);
  };

  const renderReviewItem = ({ item }: { item: PizzeriaRating }) => {
    const isExpanded = expandedReviews.has(item.id);
    const hasLongReview = item.review && item.review.length > 100;
    const reviewText = hasLongReview && !isExpanded
      ? `${item.review?.substring(0, 100)}...` 
      : item.review;

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {item.user?.avatar_url ? (
                <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person-circle" size={40} color={COLORS.textLight} />
              )}
            </View>
            <View>
              <Text style={styles.username}>{item.user?.username || 'Anonymous'}</Text>
              <Text style={styles.reviewDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <DualRatingDisplay
            overallRating={item.overall_rating}
            crustRating={item.crust_rating}
            compact={true}
            size={14}
          />
        </View>

        {reviewText && (
          <View style={styles.reviewTextContainer}>
            <Text style={styles.reviewText}>{reviewText}</Text>
            {hasLongReview && (
              <TouchableOpacity
                onPress={() => toggleReviewExpanded(item.id)}
                style={styles.expandButton}
              >
                <Text style={styles.expandButtonText}>
                  {isExpanded ? 'Show less' : 'Show more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {item.photos && item.photos.length > 0 && (
          <View style={styles.photosContainer}>
            <FlatList
              horizontal
              data={item.photos}
              keyExtractor={(photo, index) => `${item.id}-photo-${index}`}
              renderItem={({ item: photo }) => (
                <TouchableOpacity
                  onPress={() => onPhotoPress && onPhotoPress(photo)}
                >
                  <Image source={{ uri: photo }} style={styles.reviewPhoto} />
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosList}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews</Text>
      
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.reviewsList}
      />
      
      {reviews.length >= 5 && onLoadMore && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
          <Text style={styles.loadMoreText}>See all reviews</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
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
    marginBottom: SPACING.md,
  },
  reviewsList: {
    gap: SPACING.sm,
  },
  reviewCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  username: {
    fontWeight: '500',
    fontSize: 16,
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  reviewTextContainer: {
    marginBottom: SPACING.sm,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  expandButton: {
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  expandButtonText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  photosContainer: {
    marginTop: SPACING.xs,
  },
  photosList: {
    gap: SPACING.xs,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  loadMoreText: {
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default PizzeriaReviewsList;
