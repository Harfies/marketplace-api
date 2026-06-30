const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const idempotency = require("../middleware/idempotency.middleware");

const orderController = require("../controllers/order.controller");

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create Product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created
 */
router.post("/", auth, idempotency, role("buyer"), orderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get User Orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved
 */
router.get("/my-orders", auth, role("buyer"), orderController.getMyOrders);

router.get("/seller", auth, role("seller"), orderController.getSellerOrders);

router.get(
  "/seller/analytics",
  auth,
  role("seller"),
  orderController.getSellerAnalytics,
);

router.get(
  "/admin/analytics",
  auth,
  role("admin"),
  orderController.adminAnalytics,
);

router.get("/:id", auth, orderController.getOrders);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update Order Status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order updated
 */
router.patch(
  "/:id/status",
  auth,
  role("admin"),
  orderController.updateOrderStatus,
);

router.patch("/:id/cancel", auth, role("buyer"), orderController.cancelOrder);

module.exports = router;
