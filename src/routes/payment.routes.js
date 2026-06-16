const router = require("express").Router();

const auth = require("../middleware/auth.middleware");

const paymentController = require("../controllers/payment.controller");

router.post("/initialize", auth, paymentController.initializePayment);

router.get("/verify/:reference", auth, paymentController.verifyPayment);

router.post(
  "/webhook",
  paymentController.paystackWebhook
);

module.exports = router;
