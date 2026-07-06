const router = require("express").Router();
const idempotency = require("../middleware/idempotency.middleware");
const auth = require("../middleware/auth.middleware");

const paymentController = require("../controllers/payment.controller");

/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize Payment
 *     description: Creates a Paystack payment link for an existing order.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "6865f5e0d74bce0baf5c2b1a"
 *
 *     responses:
 *       200:
 *         description: Payment initialized successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 authorization_url:
 *                   type: string
 *                   example: https://checkout.paystack.com/abcdef123456
 *                 access_code:
 *                   type: string
 *                   example: PLN_7x8xxxxx
 *                 reference:
 *                   type: string
 *                   example: trxref-1751385000
 *
 *       400:
 *         description: Invalid request or payment already initialized.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       404:
 *         description: Order not found.
 *
 *       500:
 *         description: Internal server error.
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
