const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const generateOrderNumber = require("../utils/generateOrderNumber");

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { items, shippingAddress } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();

        return res.status(400).json({
          message: `${product.name} out of stock`,
        });
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const orderNumber = await generateOrderNumber(session);
    const order = await Order.create(
      [
        {
          orderNumber,
          buyer: req.user.id,
          items: orderItems,
          totalAmount,
          shippingAddress,

          statusHistory: [
            {
              status: "pending",
            },
          ],
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(201).json(order[0]);
  } catch (err) {
    await session.abortTransaction();

    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  } finally {
    session.endSession();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const orders = await Order.find({
      buyer: req.user.id,
    })
      .populate("items.product")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments({
      buyer: req.user.id,
    });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    let order;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id)
        .populate("buyer", "name email")
        .populate("items.product");
    } else {
      order = await Order.findOne({
        orderNumber: req.params.id,
      })
        .populate("buyer", "name email")
        .populate("items.product");
    }

    if (
      req.user.role !== "admin" &&
      order.buyer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    order.statusHistory.push({
      status: orderStatus,
    });

    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        message: "Order cannot be cancelled",
      });
    }

    order.orderStatus = "cancelled";

    order.statusHistory.push({
      status: "cancelled",
    });

    await order.save();

    res.json({
      message: "Order cancelled",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "items.product",
        populate: {
          path: "seller",
        },
      })
      .populate("buyer", "name email");

    const sellerOrders = orders.filter((order) =>
      order.items.some(
        (item) =>
          item.product &&
          item.product.seller &&
          item.product.seller._id.toString() === req.user.id,
      ),
    );

    res.json(sellerOrders);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getSellerAnalytics = async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: "items.product",
      populate: {
        path: "seller",
      },
    });

    const sellerOrders = orders.filter((order) =>
      order.items.some(
        (item) =>
          item.product &&
          item.product.seller &&
          item.product.seller._id.toString() === req.user.id,
      ),
    );

    const revenue = sellerOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    res.json({
      totalOrders: sellerOrders.length,
      revenue,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.adminAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending",
    });

    const revenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      revenue: revenue[0]?.totalRevenue || 0,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
