import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {string} file - base64 or file path
 * @param {Object} options - upload options
 */
export async function uploadToCloudinary(file, options = {}) {
  const result = await cloudinary.uploader.upload(file, {
    folder: 'omgs',
    resource_type: 'auto',
    ...options,
  });
  return result;
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId
 */
export async function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Generate optimized URL with transformations
 */
export function getOptimizedUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  });
}

export default cloudinary;
