require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./logger/logger");
const paymentRoutes = require("./routes/payment.routes");

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

app.use("/api/payments", paymentRoutes);
