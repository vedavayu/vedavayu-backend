const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * Upload an image file to Cloudinary
 * @param {string} filePath - Path to the image file
 * @param {string} folder - Folder in Cloudinary to store the image
 * @returns {Promise<object>} - Cloudinary upload result
 */
const uploadImage = async (filePath, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      // Optimization options
      fetch_format: 'auto',
      quality: 'auto'
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public_id of the image
 * @returns {Promise<object>} - Cloudinary deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Get optimized URL for an image
 * @param {string} publicId - Cloudinary public_id of the image
 * @param {number} width - Width for resizing
 * @param {number} height - Height for resizing
 * @returns {string} - Optimized Cloudinary URL
 */
const getOptimizedUrl = (publicId, width = 500, height = 500) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    width,
    height,
    crop: 'fill',
    gravity: 'auto'
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getOptimizedUrl
};