const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./logger/logger");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");
const limiter = require("./middleware/rateLimit.middleware");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
require("./config/redis");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const app = express();

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(limiter);
app.use(
  mongoSanitize({
    replaceWith: "_",
  }),
);
app.use(hpp());
// send morgan logs into winston
const stream = {
  write: (message) => logger.info(message.trim()),
};

app.use(morgan("combined", { stream }));

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Marketplace API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

module.exports = app;
