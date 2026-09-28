const Product = require("../models/Product");
const {
  uploadBufferToCloudinary,
  uploadManyToCloudinary,
  deleteFromCloudinary,
  deleteManyFromCloudinary,
  buildProductAssetFolder,
} = require("../utils/cloudinaryUpload");

// GET /api/products  (public — supports ?search=&category=)
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};

// GET /api/products/:id  (public)
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid product id." });
  }
};

// POST /api/products  (protected)
const createProduct = async (req, res) => {
  try {
    const { name, category, stock, description, descriptionType } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: "Name and category are required." });
    }

    const mainImageFile = req.files?.mainImage?.[0];
    if (!mainImageFile) {
      return res.status(400).json({ success: false, message: "A main product image is required." });
    }

    const productFolder = buildProductAssetFolder(name, "thumbnail");
    const mainImage = await uploadBufferToCloudinary(mainImageFile.buffer, productFolder);

    const galleryFiles = req.files?.images || [];
    const galleryFolder = buildProductAssetFolder(name, "gallery");
    const images = await uploadManyToCloudinary(galleryFiles, galleryFolder);

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      stock: Number(stock) || 0,
      description: description || "",
      descriptionType: descriptionType || "Standard Text",
      mainImage,
      images,
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: "Failed to create product." });
  }
};

// PUT /api/products/:id  (protected)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const { name, category, stock, description, descriptionType, removeImageIds } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (stock !== undefined) product.stock = Number(stock) || 0;
    if (description !== undefined) product.description = description;
    if (descriptionType !== undefined) product.descriptionType = descriptionType;

    // Replace main image if a new one was uploaded
    const newMainImageFile = req.files?.mainImage?.[0];
    if (newMainImageFile) {
      const uploaded = await uploadBufferToCloudinary(
        newMainImageFile.buffer,
        buildProductAssetFolder(product.name, "thumbnail")
      );
      await deleteFromCloudinary(product.mainImage?.public_id);
      product.mainImage = uploaded;
    }

    // Remove any gallery images the admin explicitly deleted
    if (removeImageIds) {
      let idsToRemove = [];
      try {
        idsToRemove = JSON.parse(removeImageIds);
      } catch {
        idsToRemove = [removeImageIds];
      }
      if (idsToRemove.length > 0) {
        await deleteManyFromCloudinary(idsToRemove);
        product.images = product.images.filter((img) => !idsToRemove.includes(img.public_id));
      }
    }

    // Append any newly uploaded gallery images
    const newGalleryFiles = req.files?.images || [];
    if (newGalleryFiles.length > 0) {
      const uploadedImages = await uploadManyToCloudinary(
        newGalleryFiles,
        buildProductAssetFolder(product.name, "gallery")
      );
      product.images = [...product.images, ...uploadedImages];
    }

    await product.save();

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: "Failed to update product." });
  }
};

// DELETE /api/products/:id  (protected)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const publicIdsToDelete = [
      product.mainImage?.public_id,
      ...product.images.map((img) => img.public_id),
    ].filter(Boolean);

    await deleteManyFromCloudinary(publicIdsToDelete);
    await product.deleteOne();

    return res.status(200).json({ success: true, message: "Product deleted." });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product." });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
