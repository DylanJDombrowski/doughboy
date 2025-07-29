// Update src/services/storage.ts to fix the crypto error:

import { supabase } from "./supabase";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Crypto from "expo-crypto"; // Use expo-crypto instead of nanoid
import { Alert } from "react-native";

// Storage bucket names
export const STORAGE_BUCKETS = {
  PIZZERIA_PHOTOS: "pizzeria-photos",
  RECIPE_PHOTOS: "recipe-photos",
  PROFILE_PHOTOS: "profile-photos",
};

// Maximum file size in bytes (1MB)
const MAX_FILE_SIZE = 1024 * 1024;

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
 * Interface for upload response
 */
export interface UploadResponse {
  success: boolean;
  urls?: string[];
  error?: string;
}

/**
 * Compresses and resizes an image to reduce file size
 * @param uri Path to the image file
 * @returns Compressed image file path
 */
export const compressImage = async (uri: string): Promise<string> => {
  try {
    // Check if the file is an image
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    // Get file size and type
    const fileSize = fileInfo.size || 0;

    // If file is already smaller than max size, return it as is
    if (fileSize <= MAX_FILE_SIZE) {
      return uri;
    }

    // Calculate compression quality based on file size
    // Larger files get more compression
    let quality = 0.8;
    if (fileSize > MAX_FILE_SIZE * 2) {
      quality = 0.6;
    }
    if (fileSize > MAX_FILE_SIZE * 4) {
      quality = 0.4;
    }

    // Resize and compress the image
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Resize to max width of 1200px
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipResult.uri;
  } catch (error) {
    console.error("Error compressing image:", error);
    return uri; // Return original if compression fails
  }
};

/**
 * Uploads multiple photos to Supabase storage
 * @param photos Array of photo URIs to upload
 * @param bucket Storage bucket name
 * @param folder Optional folder within the bucket
 * @returns URLs of the uploaded photos
 */
export const uploadPhotos = async (
  photos: string[],
  bucket: string,
  folder: string = ""
): Promise<UploadResponse> => {
  try {
    if (!photos || photos.length === 0) {
      return { success: true, urls: [] };
    }

    const uploadedUrls: string[] = [];

    for (const photoUri of photos) {
      // Compress the image before uploading
      const compressedUri = await compressImage(photoUri);

      // Generate a unique file name using expo-crypto
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
    }

    return { success: true, urls: uploadedUrls };
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
 * Gets the public URL for a photo
 * @param path Full path of the photo in storage
 * @param bucket Storage bucket name
 * @returns Public URL of the photo
 */
export const getPhotoUrl = (path: string, bucket: string): string => {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
};

/**
 * Deletes photos from Supabase storage
 * @param paths Array of photo paths to delete
 * @param bucket Storage bucket name
 * @returns Success status
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
      const url = new URL(path);
      return url.pathname.split("/").pop() || path;
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
