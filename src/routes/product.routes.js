const router = require("express").Router();

const productController = require("../controllers/product.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../config/multer");

// 🛒 Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// 🔐 Seller-only routes
router.post(
  "/",
  auth,
  role("seller", "admin"),
  upload.array("images", 5),
  productController.createProduct,
);

router.put(
  "/:id",
  auth,
  role("seller", "admin"),
  productController.updateProduct,
);

router.delete(
  "/:id",
  auth,
  role("seller", "admin"),
  productController.deleteProduct,
);

module.exports = router;
