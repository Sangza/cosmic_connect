const express = require("express");
const app = express();
const mongoose = require("mongoose");
const auth = require("./route/auth");
const user = require("./route/user");
const coupon = require("./route/coupon");
const payment = require("./route/payment");
const spot = require("./route/spot");
const price = require("./route/price");
const webhook = require("./route/webhook");
const dotenv = require("dotenv");
const config = require("config");
const cors = require("cors");
const twilio = require("twilio");
const { required } = require("joi");

dotenv.config();

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwt is not defined");
  process.exit(1);
}

// // ✅ Use CORS Middleware BEFORE defining routes
// const allowedOrigins = [
//   "http://localhost:64811", // Local Development
//   "https://your-production-domain.com", // Replace with your frontend URL
// ];

// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: "GET, POST, PUT, DELETE, OPTIONS",
//     allowedHeaders: "Content-Type, Authorization",
//     credentials: true,
//   })
// );
app.use("/api/webhook", webhook);
app.use(cors());
// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ Routes
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use("/api/coupon", coupon);
app.use("/api/payment", payment);
app.use("/api/spot", spot);
app.use("/api/price", price);

// ✅ Connect to MongoDB

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Successfully connected to MongoDB!");

    const port = process.env.PORT || 7000;
    app.listen(port, () => {
      console.log(`🚀 Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

run();
