const { body } = require("express-validator");

exports.createOrderValidator = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),

  body("items.*.product")
    .notEmpty()
    .withMessage("Product ID is required"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("shippingAddress.fullName")
    .notEmpty()
    .withMessage("Full name is required"),

  body("shippingAddress.phone")
    .notEmpty()
    .withMessage("Phone number is required"),

  body("shippingAddress.address")
    .notEmpty()
    .withMessage("Address is required"),
];