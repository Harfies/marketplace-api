const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: String,

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      index: true,
    },

    images: [String],

    stock: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// 🔍 Text index for search
productSchema.index({
  name: "text",
  description: "text",
  category: "text",
});

module.exports = mongoose.model("Product", productSchema);
