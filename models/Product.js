const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    descriptionType: {
      type: String,
      enum: ["Standard Text", "Rich HTML", "Markdown", "Bullet Points"],
      default: "Standard Text",
    },
    description: {
      type: String,
      default: "",
    },
    mainImage: {
      type: imageSchema,
      required: [true, "Main product image is required"],
    },
    images: {
      type: [imageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
