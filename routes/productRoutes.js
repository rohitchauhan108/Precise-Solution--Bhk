const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { productUpload } = require("../middleware/upload");

const router = express.Router();

// Public — the storefront frontend can also read from these
router.get("/", getProducts);
router.get("/:id", getProduct);

// Protected — admin only
router.post("/", protect, productUpload, createProduct);
router.put("/:id", protect, productUpload, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
