import cloudinary from "../config/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any;
  resource_type?: "image" | "video" | "raw" | "auto";
  format?: string;
  quality?: string | number;
  width?: number;
  height?: number;
  crop?: string;
}

export const uploadToCloudinary = async (
  file: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    const uploadOptions = {
      resource_type: options.resource_type || "auto",
      folder: options.folder || "uploads",
      ...options,
    };

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      file,
      uploadOptions
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    const cloudinaryError = error as UploadApiErrorResponse;
    throw new Error(`Cloudinary upload failed: ${cloudinaryError.message}`);
  }
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ result: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error}`);
  }
};

export const generateTransformationUrl = (
  publicId: string,
  transformations: any = {}
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations,
  });
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: options.resource_type || "auto",
      folder: options.folder || "uploads",
      ...options,
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary buffer upload failed: ${error.message}`));
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            url: result.url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
          });
        } else {
          reject(new Error("Cloudinary upload failed: No result returned"));
        }
      }
    ).end(buffer);
  });
};

export const uploadBase64ToCloudinary = async (
  base64Data: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    // Clean up base64 data - remove data URI prefix if already present
    let cleanBase64 = base64Data;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    } else if (cleanBase64.startsWith('data:')) {
      cleanBase64 = cleanBase64.split(',')[1];
    }

    // Validate base64 string
    if (!cleanBase64 || cleanBase64.trim() === '') {
      throw new Error('Invalid or empty base64 data provided');
    }

    // Determine MIME type from options or default to PNG
    const mimeType = options.format ? `image/${options.format}` : 'image/png';
    const dataUri = `data:${mimeType};base64,${cleanBase64}`;

    const uploadOptions = {
      resource_type: options.resource_type || "auto",
      folder: options.folder || "uploads",
      ...options,
    };

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      dataUri,
      uploadOptions
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    const cloudinaryError = error as UploadApiErrorResponse;
    const errorMsg = cloudinaryError.message || String(error);
    throw new Error(`Cloudinary base64 upload failed: ${errorMsg}`);
  }
};

export const getCloudinaryResource = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch Cloudinary resource: ${error}`);
  }
};

export const listCloudinaryResources = async (
  options: {
    resourceType?: "image" | "video" | "raw";
    folder?: string;
    maxResults?: number;
    nextCursor?: string;
  } = {}
) => {
  try {
    const result = await cloudinary.api.resources({
      resource_type: options.resourceType || "image",
      type: "upload",
      prefix: options.folder,
      max_results: options.maxResults || 10,
      next_cursor: options.nextCursor,
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to list Cloudinary resources: ${error}`);
  }
};

export default {
  uploadToCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  generateTransformationUrl,
  uploadBase64ToCloudinary,
  getCloudinaryResource,
  listCloudinaryResources,
};