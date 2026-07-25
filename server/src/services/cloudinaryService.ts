import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Upload a base64 data URI or a remote URL to Cloudinary.
 * Returns the secure URL of the uploaded asset.
 */
export const uploadToCloudinary = async (
  dataUri: string,
  folder: string = 'connecthub'
): Promise<string> => {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'auto',
    quality: 'auto:good',
    fetch_format: 'auto',
  });
  return result.secure_url;
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
