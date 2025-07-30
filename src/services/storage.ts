// src/services/storage.ts - Enhanced with Photo Metadata Support
import { supabase } from "./supabase";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Crypto from "expo-crypto";
import { Alert } from "react-native";

// Storage bucket names
export const STORAGE_BUCKETS = {
  PIZZERIA_PHOTOS: "pizzeria-photos",
  RECIPE_PHOTOS: "recipe-photos",
  PROFILE_PHOTOS: "profile-photos",
};

// Maximum file size in bytes (1MB)
const MAX_FILE_SIZE = 1024 * 1024;

// Photo metadata interface
export interface PhotoMetadata {
  uploadedAt: string;
  originalSize: { width: number; height: number };
  compressedSize: { width: number; height: number };
  location?: { latitude: number; longitude: number };
  reviewId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  overallRating: number;
  crustRating: number;
  reviewText?: string;
}

// Generate unique filename using expo-crypto
const generateUniqueFilename = async (): Promise<string> => {
  const timestamp = Date.now();
  const randomBytes = await Crypto.getRandomBytesAsync(8);
  const randomString = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `${timestamp}_${randomString}`;
};

/**
 * Interface for upload response with metadata
 */
export interface UploadResponse {
  success: boolean;
  urls?: string[];
  metadata?: PhotoMetadata[];
  error?: string;
}

/**
 * Get image dimensions from URI
 */
const getImageDimensions = async (
  uri: string
): Promise<{ width: number; height: number }> => {
  try {
    const { width, height } = await new Promise<{
      width: number;
      height: number;
    }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = uri;
    });
    return { width, height };
  } catch {
    // Fallback if dimensions can't be determined
    return { width: 1200, height: 900 };
  }
};

/**
 * Compresses and resizes an image to reduce file size
 */
export const compressImage = async (
  uri: string,
  options: {
    maxWidth?: number;
    quality?: number;
  } = {}
): Promise<{
  uri: string;
  originalSize: { width: number; height: number };
  compressedSize: { width: number; height: number };
}> => {
  try {
    const { maxWidth = 1200, quality = 0.8 } = options;

    // Get original dimensions
    const originalSize = await getImageDimensions(uri);

    // Check if the file is an image
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    // Get file size
    const fileSize = fileInfo.size || 0;

    // Calculate compression quality based on file size
    let adjustedQuality = quality;
    if (fileSize > MAX_FILE_SIZE * 2) {
      adjustedQuality = Math.min(quality, 0.6);
    }
    if (fileSize > MAX_FILE_SIZE * 4) {
      adjustedQuality = Math.min(quality, 0.4);
    }

    // Resize and compress the image
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: adjustedQuality, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Get compressed dimensions
    const compressedSize = await getImageDimensions(manipResult.uri);

    return {
      uri: manipResult.uri,
      originalSize,
      compressedSize,
    };
  } catch (error) {
    console.error("Error compressing image:", error);
    // Return original if compression fails
    const fallbackSize = { width: 1200, height: 900 };
    return {
      uri,
      originalSize: fallbackSize,
      compressedSize: fallbackSize,
    };
  }
};

/**
 * Uploads multiple photos to Supabase storage with metadata
 */
export const uploadPhotos = async (
  photos: string[],
  bucket: string,
  folder: string = "",
  metadata?: Partial<PhotoMetadata>
): Promise<UploadResponse> => {
  try {
    if (!photos || photos.length === 0) {
      return { success: true, urls: [], metadata: [] };
    }

    const uploadedUrls: string[] = [];
    const photoMetadata: PhotoMetadata[] = [];

    for (const photoUri of photos) {
      // Compress the image and get dimensions
      const {
        uri: compressedUri,
        originalSize,
        compressedSize,
      } = await compressImage(photoUri);

      // Generate a unique file name
      const uniqueId = await generateUniqueFilename();
      const fileName = `${folder ? folder + "/" : ""}${uniqueId}.jpg`;

      // Convert file to base64 for upload
      const fileBase64 = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to blob for upload
      const blob = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));

      // Upload file to Supabase
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);

      // Create metadata for this photo
      if (metadata) {
        const photoMeta: PhotoMetadata = {
          uploadedAt: new Date().toISOString(),
          originalSize,
          compressedSize,
          reviewId: metadata.reviewId || "",
          reviewerName: metadata.reviewerName || "",
          reviewerAvatar: metadata.reviewerAvatar,
          overallRating: metadata.overallRating || 0,
          crustRating: metadata.crustRating || 0,
          reviewText: metadata.reviewText,
          location: metadata.location,
        };
        photoMetadata.push(photoMeta);
      }
    }

    return {
      success: true,
      urls: uploadedUrls,
      metadata: photoMetadata,
    };
  } catch (error) {
    console.error("Error uploading photos:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error during upload",
    };
  }
};

/**
 * Upload a single photo with progress callback
 */
export const uploadSinglePhoto = async (
  photoUri: string,
  bucket: string,
  folder: string = "",
  onProgress?: (progress: number) => void,
  metadata?: Partial<PhotoMetadata>
): Promise<{
  success: boolean;
  url?: string;
  metadata?: PhotoMetadata;
  error?: string;
}> => {
  try {
    onProgress?.(10);

    const {
      uri: compressedUri,
      originalSize,
      compressedSize,
    } = await compressImage(photoUri);
    onProgress?.(30);

    const uniqueId = await generateUniqueFilename();
    const fileName = `${folder ? folder + "/" : ""}${uniqueId}.jpg`;

    onProgress?.(50);

    const fileBase64 = await FileSystem.readAsStringAsync(compressedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    onProgress?.(70);

    const blob = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    onProgress?.(90);

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    // Create metadata
    let photoMeta: PhotoMetadata | undefined;
    if (metadata) {
      photoMeta = {
        uploadedAt: new Date().toISOString(),
        originalSize,
        compressedSize,
        reviewId: metadata.reviewId || "",
        reviewerName: metadata.reviewerName || "",
        reviewerAvatar: metadata.reviewerAvatar,
        overallRating: metadata.overallRating || 0,
        crustRating: metadata.crustRating || 0,
        reviewText: metadata.reviewText,
        location: metadata.location,
      };
    }

    onProgress?.(100);

    return {
      success: true,
      url: publicUrl,
      metadata: photoMeta,
    };
  } catch (error) {
    console.error("Error uploading photo:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error during upload",
    };
  }
};

/**
 * Gets the public URL for a photo
 */
export const getPhotoUrl = (path: string, bucket: string): string => {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
};

/**
 * Deletes photos from Supabase storage
 */
export const deletePhotos = async (
  paths: string[],
  bucket: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!paths || paths.length === 0) {
      return { success: true };
    }

    // Extract only the filenames from full URLs
    const fileNames = paths.map((path) => {
      try {
        const url = new URL(path);
        return url.pathname.split("/").pop() || path;
      } catch {
        // If not a valid URL, assume it's already a filename
        return path;
      }
    });

    const { error } = await supabase.storage.from(bucket).remove(fileNames);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting photos:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during deletion",
    };
  }
};

/**
 * Generate thumbnail for a photo
 */
export const generateThumbnail = async (
  photoUri: string,
  size: number = 200
): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ resize: { width: size, height: size } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return photoUri; // Return original if thumbnail generation fails
  }
};

/**
 * Batch upload with individual progress tracking
 */
export const batchUploadPhotos = async (
  photos: string[],
  bucket: string,
  folder: string = "",
  onProgress?: (photoIndex: number, progress: number) => void,
  metadata?: Partial<PhotoMetadata>
): Promise<UploadResponse> => {
  try {
    const results: string[] = [];
    const metadataResults: PhotoMetadata[] = [];

    for (let i = 0; i < photos.length; i++) {
      const result = await uploadSinglePhoto(
        photos[i],
        bucket,
        folder,
        (progress) => onProgress?.(i, progress),
        metadata
      );

      if (result.success && result.url) {
        results.push(result.url);
        if (result.metadata) {
          metadataResults.push(result.metadata);
        }
      } else {
        throw new Error(result.error || `Failed to upload photo ${i + 1}`);
      }
    }

    return {
      success: true,
      urls: results,
      metadata: metadataResults,
    };
  } catch (error) {
    console.error("Error in batch upload:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Batch upload failed",
    };
  }
};
