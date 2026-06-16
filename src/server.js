require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const paymentRoutes = require("./routes/payment.routes");

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/payments", paymentRoutes);
