const cloudinary = require("cloudinary").v2;

// Configure Cloudinary using credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer directly to Cloudinary.
 * 
 * @param {Buffer} fileBuffer - The image file buffer from memory
 * @param {string} [folder="srk-handloom/products"] - Destination folder path
 * @returns {Promise<object>} Promise resolving to Cloudinary upload results
 */
const uploadBuffer = (fileBuffer, folder = "srk-handloom/products") => {
  return new Promise((resolve, reject) => {
    // Validate credentials presence before streaming
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new Error("Cloudinary environment variables are not configured in backend/.env."));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        overwrite: false,
        secure: true,
        resource_type: "image",
        // Automatically optimize delivery format (webp, etc.) and quality settings
        transformation: [
          { width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // End the write stream with the image buffer
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an asset from Cloudinary using its public ID.
 * 
 * @param {string} publicId - The Cloudinary public ID (e.g. "srk-handloom/products/xyz")
 * @returns {Promise<object>} Promise resolving to Cloudinary delete response
 */
const deleteImage = (publicId) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new Error("Cloudinary environment variables are not configured in backend/.env."));
    }

    cloudinary.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  uploadBuffer,
  deleteImage,
};
