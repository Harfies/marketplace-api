const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const generateOrderNumber = require("../utils/generateOrderNumber");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { orderCreatedTemplate } = require("../templates/orderCreatedTemplate");
const {
  orderProcessingTemplate,
} = require("../templates/orderProcessingTemplate");

const { orderShippedTemplate } = require("../templates/orderShippedTemplate");

const {
  orderDeliveredTemplate,
} = require("../templates/orderDeliveredTemplate");

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

    const buyer = await User.findById(req.user.id);

    if (buyer?.email) {
      await sendEmail({
        to: buyer.email,
        subject: "Order Created",
        html: orderCreatedTemplate({
          name: buyer.name || buyer.email,
          orderNumber,
          amount: totalAmount,
        }),
      });
    }

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
    const {
      page = 1,
      limit = 10,
      paymentStatus,
      orderStatus,
      sort = "desc",
    } = req.query;

    const query = {
      buyer: req.user.id,
    };

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    const orders = await Order.find(query)
      .populate("items.product", "name price image")
      .sort({
        createdAt: sort === "asc" ? 1 : -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getOrders = async (req, res) => {
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

    const buyer = await User.findById(order.buyer);

    if (orderStatus === "processing") {
      await sendEmail({
        to: buyer.email,
        subject: "Order Processing",
        html: orderProcessingTemplate({
          name: buyer.name || buyer.email,
          orderNumber: order.orderNumber,
        }),
      });
    }

    if (orderStatus === "shipped") {
      await sendEmail({
        to: buyer.email,
        subject: "Order Shipped",
        html: orderShippedTemplate({
          name: buyer.name || buyer.email,
          orderNumber: order.orderNumber,
        }),
      });
    }

    if (orderStatus === "delivered") {
      await sendEmail({
        to: buyer.email,
        subject: "Order Delivered",
        html: orderDeliveredTemplate({
          name: buyer.name || buyer.email,
          orderNumber: order.orderNumber,
        }),
      });
    }

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
    const {
      page = 1,
      limit = 10,
      paymentStatus,
      orderStatus,
      sort = "desc",
    } = req.query;

    const currentPage = Number(page);
    const pageSize = Number(limit);

    const matchStage = {};

    if (paymentStatus) {
      matchStage.paymentStatus = paymentStatus;
    }

    if (orderStatus) {
      matchStage.orderStatus = orderStatus;
    }

    const result = await Order.aggregate([
      // Filter by payment/order status
      {
        $match: matchStage,
      },

      // Split items array
      {
        $unwind: "$items",
      },

      // Join Product
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },

      // Convert product array to object
      {
        $unwind: "$product",
      },

      // Keep only this seller's products
      {
        $match: {
          "product.seller": new mongoose.Types.ObjectId(req.user.id),
        },
      },

      // Join Buyer
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer",
        },
      },

      {
        $unwind: "$buyer",
      },

      // Rebuild each order
      {
        $group: {
          _id: "$_id",

          orderNumber: {
            $first: "$orderNumber",
          },

          buyer: {
            $first: {
              _id: "$buyer._id",
              name: "$buyer.name",
              email: "$buyer.email",
            },
          },

          totalAmount: {
            $first: "$totalAmount",
          },

          paymentStatus: {
            $first: "$paymentStatus",
          },

          orderStatus: {
            $first: "$orderStatus",
          },

          shippingAddress: {
            $first: "$shippingAddress",
          },

          createdAt: {
            $first: "$createdAt",
          },

          items: {
            $push: {
              quantity: "$items.quantity",
              price: "$items.price",
              product: {
                _id: "$product._id",
                name: "$product.name",
                images: "$product.images",
                seller: "$product.seller",
              },
            },
          },
        },
      },

      // Sort
      {
        $sort: {
          createdAt: sort === "asc" ? 1 : -1,
        },
      },

      // Pagination + Total Count
      {
        $facet: {
          metadata: [
            {
              $count: "total",
            },
          ],

          data: [
            {
              $skip: (currentPage - 1) * pageSize,
            },
            {
              $limit: pageSize,
            },
          ],
        },
      },
    ]);

    const total = result[0].metadata.length ? result[0].metadata[0].total : 0;

    res.status(200).json({
      success: true,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageSize),
      count: result[0].data.length,
      data: result[0].data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
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
