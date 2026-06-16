const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const orderController = require("../controllers/order.controller");

router.post("/", auth, role("buyer"), orderController.createOrder);

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

router.get("/:id", auth, orderController.getOrder);

router.patch(
  "/:id/status",
  auth,
  role("admin"),
  orderController.updateOrderStatus,
);

router.patch("/:id/cancel", auth, role("buyer"), orderController.cancelOrder);

module.exports = router;
