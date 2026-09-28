const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

// Used on create/update product routes:
// - "mainImage": single cover image
// - "images": up to 6 gallery images
const productUpload = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

module.exports = { productUpload };
