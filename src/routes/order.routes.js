const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const idempotency = require("../middleware/idempotency.middleware");

const orderController = require("../controllers/order.controller");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create Order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *         example: order-003
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product
 *                     - quantity
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: "6865f5e0d74bce0baf5c2b1a"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - phone
 *                   - address
 *                   - city
 *                   - state
 *                   - country
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: "Afeez Akinsola"
 *                   phone:
 *                     type: string
 *                     example: "08012345678"
 *                   address:
 *                     type: string
 *                     example: "12 Allen Avenue"
 *                   city:
 *                     type: string
 *                     example: "Ikeja"
 *                   state:
 *                     type: string
 *                     example: "Lagos"
 *                   country:
 *                     type: string
 *                     example: "Nigeria"
 *
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", auth, idempotency, role("buyer"), orderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - _id: 684abc123
 *                   orderNumber: ORD-2026-000001
 *                   totalAmount: 120000
 *                   paymentStatus: paid
 *                   orderStatus: processing
 *                 - _id: 684abc124
 *                   orderNumber: ORD-2026-000002
 *                   totalAmount: 50000
 *                   paymentStatus: pending
 *                   orderStatus: pending
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, role("buyer"), orderController.getMyOrders);

/**
 * @swagger
 * /api/orders/seller:
 *   get:
 *     summary: Get all orders belonging to the authenticated seller
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller orders retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               totalOrders: 5
 *               data:
 *                 - orderNumber: ORD-2026-000001
 *                   buyer:
 *                     name: John Doe
 *                     email: john@gmail.com
 *                   totalAmount: 250000
 *                   paymentStatus: paid
 *                   orderStatus: processing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller access only
 */
router.get("/seller", auth, role("seller"), orderController.getSellerOrders);

/**
 * @swagger
 * /api/orders/seller/analytics:
 *   get:
 *     summary: Get analytics for authenticated seller
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller analytics retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               analytics:
 *                 totalProducts: 18
 *                 totalOrders: 40
 *                 pendingOrders: 5
 *                 processingOrders: 8
 *                 shippedOrders: 10
 *                 deliveredOrders: 17
 *                 totalRevenue: 4560000
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller access only
 */
router.get(
  "/seller/analytics",
  auth,
  role("seller"),
  orderController.getSellerAnalytics,
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order
 *     description: Returns a specific order by its ID.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *           example: 685bb4a21d7d5b4b0b0b1234
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", auth, orderController.getOrders);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update an order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderStatus
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - processing
 *                   - shipped
 *                   - delivered
 *                   - cancelled
 *                 example: shipped
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Order status updated successfully
 *               data:
 *                 orderNumber: ORD-2026-000005
 *                 paymentStatus: paid
 *                 orderStatus: shipped
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller/Admin only
 *       404:
 *         description: Order not found
 */
router.patch(
  "/:id/status",
  auth,
  role("admin"),
  orderController.updateOrderStatus,
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     description: Allows the buyer to cancel an order before it has been shipped. Cancelled orders cannot be paid for or modified.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Order ID
 *         schema:
 *           type: string
 *           example: 685bb4a21d7d5b4b0b0b1234
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *             example:
 *               success: true
 *               message: Order cancelled successfully
 *               data:
 *                 orderNumber: ORD-2026-000015
 *                 orderStatus: cancelled
 *                 paymentStatus: pending
 *       400:
 *         description: Order cannot be cancelled because it has already been shipped or delivered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: You are not authorized to cancel this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/cancel", auth, role("buyer"), orderController.cancelOrder);

module.exports = router;
