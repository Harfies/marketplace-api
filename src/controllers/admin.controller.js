const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const paidOrders = await Order.countDocuments({
      paymentStatus: "paid",
    });

    const pendingOrders = await Order.countDocuments({
      paymentStatus: "pending",
    });

    const revenueResult = await Order.aggregate([
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

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
            year: {
              $year: "$createdAt",
            },
          },
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.json(revenue);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
