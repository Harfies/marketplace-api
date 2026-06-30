const Product = require("../models/product");
const redisClient = require("../config/redis");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const images = req.files?.map((file) => file.path) || [];

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images,
      seller: req.user.id,
    });

    // 🗑 Clear cached product lists
    const keys = await redisClient.keys("products:*");

    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log("🗑 Product cache cleared");
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    // Create unique cache key based on query parameters
    const cacheKey = `products:${JSON.stringify(req.query)}`;

    // Check Redis first
    const cachedProducts = await redisClient.get(cacheKey);

    if (cachedProducts) {
      console.log("✅ CACHE HIT");
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    console.log("❌ CACHE MISS");

    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    const query = {};

    // 🔎 Search by product name
    if (search) {
      query.$text = { $search: search };
    }

    // 🏷 Filter by category
    if (category) {
      query.category = category;
    }

    // 💰 Filter by price
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // 📦 Filter by stock
    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    if (inStock === "false") {
      query.stock = 0;
    }

    // 🔄 Sorting
    let sortOption = { createdAt: -1 };

    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;

      case "price_desc":
        sortOption = { price: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "name_asc":
        sortOption = { name: 1 };
        break;

      case "name_desc":
        sortOption = { name: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const currentPage = Number(page);
    const pageSize = Number(limit);
    const skip = (currentPage - 1) * pageSize;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    const totalProducts = await Product.countDocuments(query);

    // Create response object
    const response = {
      success: true,
      message: "Products fetched successfully",

      pagination: {
        totalItems: totalProducts,
        totalPages: Math.ceil(totalProducts / pageSize),
        currentPage,
        pageSize,
        hasNextPage: currentPage < Math.ceil(totalProducts / pageSize),
        hasPrevPage: currentPage > 1,
      },

      filters: {
        search: search || null,
        category: category || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        inStock: inStock || null,
        sort: sort || "newest",
      },

      data: products,
    };

    // Save response to Redis for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(response), {
      EX: 300,
    });

    console.log("📦 Products cached in Redis");

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Single Product
exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Create cache key
    const cacheKey = `product:${productId}`;

    // Check Redis first
    const cachedProduct = await redisClient.get(cacheKey);

    if (cachedProduct) {
      console.log("✅ PRODUCT CACHE HIT");

      return res.status(200).json(JSON.parse(cachedProduct));
    }

    console.log("❌ PRODUCT CACHE MISS");

    // Get product from MongoDB
    const product = await Product.findById(productId).populate(
      "seller",
      "name email",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const response = {
      success: true,
      message: "Product fetched successfully",
      data: product,
    };

    // Save to Redis for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(response), {
      EX: 300,
    });

    console.log("📦 Product cached");

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // 🗑 Clear all cached product lists
    const keys = await redisClient.keys("products:*");

    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log("🗑 Product cache cleared");
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await product.deleteOne();

    // 🗑 Clear all cached product lists
    const keys = await redisClient.keys("products:*");

    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log("🗑 Product cache cleared");
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
