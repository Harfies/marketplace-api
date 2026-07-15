const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../models/order");
const Payment = require("../models/payment");
const Product = require("../models/product");
const User = require("../models/user");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const orderEmailTemplate = require("../utils/orderEmailTemplate");
const {
  paymentSuccessTemplate,
} = require("../templates/paymentSuccessTemplate");

exports.initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: order.totalAmount * 100,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paystackData = response.data.data;

    // Save Paystack reference on the order
    order.paymentReference = paystackData.reference;
    await order.save();

    res.json(paystackData);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const paymentData = response.data.data;

    logger.info("PAYSTACK VERIFY RESPONSE:");
    logger.info(paymentData);

    // Check Paystack payment status
    if (paymentData.status !== "success") {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Payment not successful",
      });
    }

    // Prevent duplicate verification
    const existingPayment = await Payment.findOne({
      reference,
    });

    if (existingPayment) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Payment already verified",
      });
    }

    // Find order linked to reference
    const order = await Order.findOne({
      paymentReference: reference,
    });

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Create payment record
    await Payment.create(
      [
        {
          order: order._id,
          buyer: order.buyer,
          amount: order.totalAmount,
          reference,
          status: "paid",

          // Use actual Paystack payment time
          paidAt: new Date(paymentData.paid_at),
        },
      ],
      { session },
    );

    // Update order payment status
    order.paymentStatus = "paid";

    const buyer = await User.findById(order.buyer);

    await sendEmail({
      to: buyer.email,
      subject: "Payment Successful",
      html: paymentSuccessTemplate({
        name: buyer.name || buyer.email,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
      }),
    });

    // Payment received → move order to processing
    order.orderStatus = "processing";

    await order.save({ session });

    // Deduct stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        { session },
      );
    }

    await session.commitTransaction();

    const user = await User.findById(order.buyer);

    await sendEmail({
      to: user.email,
      subject: "Order Confirmation",
      html: orderEmailTemplate(order),
    });

    res.json({
      message: "Payment verified successfully",
      reference,
      orderId: order._id,
    });
  } catch (err) {
    await session.abortTransaction();

    logger.error(err);

    res.status(500).json({
      message: err.message,
    });
  } finally {
    session.endSession();
  }
};

exports.paystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    logger.info("PAYSTACK EVENT:", event.event);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      const existingPayment = await Payment.findOne({
        reference,
      });

      if (existingPayment) {
        return res.sendStatus(200);
      }

      const order = await Order.findOne({
        paymentReference: reference,
      });

      if (!order) {
        return res.sendStatus(200);
      }

      await Payment.create({
        order: order._id,
        buyer: order.buyer,
        amount: order.totalAmount,
        reference,
        status: "paid",
        paidAt: new Date(),
      });

      order.paymentStatus = "paid";

      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: -item.quantity,
          },
        });
      }

      const buyer = await User.findById(order.buyer);

      if (buyer?.email) {
        await sendEmail({
          to: buyer.email,
          subject: "Payment Successful",
          html: paymentSuccessTemplate({
            name: buyer.name || buyer.email,
            orderNumber: order.orderNumber,
            amount: order.totalAmount,
          }),
        });
      }

      logger.info(`Payment verified automatically: ${reference}`);
    }

    res.sendStatus(200);
  } catch (err) {
    logger.error(err);

    res.sendStatus(500);
  }
};
