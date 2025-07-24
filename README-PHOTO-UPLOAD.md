# Doughboy Photo Upload System

This document outlines the photo upload system implementation for the Doughboy pizza app.

## Overview

The photo upload system allows users to add photos to their pizzeria reviews. The system includes:

1. Supabase Storage configuration with proper RLS policies
2. Photo compression and upload utilities
3. UI components for photo selection and preview
4. Review modal with photo upload integration

## Key Components

### 1. Supabase Storage Configuration (`/supabase/storage.sql`)

- Creates three storage buckets:
  - `pizzeria-photos`: For pizzeria review photos
  - `recipe-photos`: For recipe photos
  - `profile-photos`: For user profile photos
- Sets up Row Level Security (RLS) policies for each bucket:
  - Public read access for all photos
  - Write access restricted to authenticated users
  - Update/delete access restricted to photo owners

### 2. Storage Utilities (`/src/services/storage.ts`)

- `compressImage()`: Resizes and compresses images before upload (max width: 1200px)
- `uploadPhotos()`: Uploads multiple images to Supabase storage
- `getPhotoUrl()`: Retrieves the public URL for a stored photo
- `deletePhotos()`: Deletes photos from storage

### 3. UI Components

#### Photo Upload Component (`/src/components/upload/PhotoUpload.tsx`)

- Allows selecting photos from gallery or taking new photos with camera
- Shows preview of selected photos with option to remove
- Enforces maximum photo limit
- Handles permissions for camera and photo library access

#### Review Modal (`/src/components/ratings/ReviewModal.tsx`)

- Combines dual rating input (overall + crust ratings)
- Text review input with character limit
- Photo upload integration
- Submits all data to Supabase with proper error handling

### 4. Photo Display

- Shows uploaded photos in review cards
- Photo gallery on pizzeria detail screen displays all photos from reviews
- Lightbox for full-screen photo viewing
- Empty state indicators when no photos are available

## Usage Flow

1. User navigates to a pizzeria detail page
2. User taps "Review" button to open the review modal
3. User can rate the pizzeria, write a review, and add photos
4. After submission, photos are compressed, uploaded to Supabase, and URLs are stored with the review
5. The pizzeria detail page refreshes to show the new review and photos

## Technical Details

- Image compression: Max file size target is 1MB
- Image dimensions: Resized to max width of 1200px
- Supported image types: JPEG, PNG, HEIC/HEIF
- Storage bucket structure: Photos are stored in folders by pizzeria ID

## Error Handling

- Permission denials: Users are prompted to grant camera and photo library permissions
- Upload failures: Error messages are displayed with option to retry
- Size limits: UI prevents exceeding maximum photo count

## Future Improvements

- Add image rotation/cropping tools
- Implement lazy loading for photo galleries
- Add progress indicators for multi-photo uploads
- Implement photo moderation system
