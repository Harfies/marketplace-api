const router = require("express").Router();
const logger = require("../logger/logger");

const productController = require("../controllers/product.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../config/multer");

//  Public routes
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", productController.getProducts);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved
 *       404:
 *         description: Product not found
 */
router.get("/:id", productController.getProduct);

// 🔐 Seller-only routes
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
router.post(
  "/",
  auth,
  role("seller", "admin"),
  upload.array("images", 5),
  productController.createProduct,
);

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15 Pro Max
 *               description:
 *                 type: string
 *                 example: Updated product description
 *               price:
 *                 type: number
 *                 example: 1200000
 *               category:
 *                 type: string
 *                 example: Phones
 *               stock:
 *                 type: number
 *                 example: 25
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.put(
  "/:id",
  auth,
  role("seller", "admin"),
  productController.updateProduct,
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete Product
 *     tags: [Products]
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
 *         description: Product deleted
 */
router.delete(
  "/:id",
  auth,
  role("seller", "admin"),
  productController.deleteProduct,
);

module.exports = router;
