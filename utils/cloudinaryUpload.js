const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const getProductFolderPath = (productName = "Product") => {
  const safeName = String(productName || "Product")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();

  const cleanedName = safeName || "Product";
  return `Precise Solution/${cleanedName}`;
};

/**
 * Uploads a single in-memory file buffer (from multer memoryStorage) to Cloudinary.
 * Returns { url, public_id }.
 */
const uploadBufferToCloudinary = (buffer, folder = "Precise Solution") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Uploads an array of multer files (memoryStorage) in parallel.
 */
const uploadManyToCloudinary = async (files = [], folder = "Precise Solution") => {
  return Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer, folder)));
};

const buildProductAssetFolder = (productName, type = "thumbnail") => {
  const baseFolder = getProductFolderPath(productName);
  return `${baseFolder}/${type}`;
};

/**
 * Deletes a single Cloudinary asset by public_id. Never throws — logs and continues,
 * since a failed cleanup shouldn't block the main DB operation.
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error.message);
  }
};

const deleteManyFromCloudinary = async (publicIds = []) => {
  await Promise.all(publicIds.filter(Boolean).map((id) => deleteFromCloudinary(id)));
};

module.exports = {
  uploadBufferToCloudinary,
  uploadManyToCloudinary,
  buildProductAssetFolder,
  deleteFromCloudinary,
  deleteManyFromCloudinary,
};
