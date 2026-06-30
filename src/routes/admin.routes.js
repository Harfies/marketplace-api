const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin Dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/dashboard", auth, adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/revenue:
 *   get:
 *     summary: Revenue Analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue data
 */
router.get("/revenue", auth, adminController.getRevenueAnalytics);

module.exports = router;
