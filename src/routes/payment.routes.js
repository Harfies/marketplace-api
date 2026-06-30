const router = require("express").Router();
const idempotency = require("../middleware/idempotency.middleware");
const auth = require("../middleware/auth.middleware");

const paymentController = require("../controllers/payment.controller");

/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize Paystack Payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment initialized
 */
router.post(
  "/initialize",
  auth,
  idempotency,
  paymentController.initializePayment,
);

/**
 * @swagger
 * /api/payments/verify/{reference}:
 *   get:
 *     summary: Verify Payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.get("/verify/:reference", auth, paymentController.verifyPayment);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Paystack Webhook
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post("/webhook", paymentController.paystackWebhook);

module.exports = router;
