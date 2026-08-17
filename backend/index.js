import "dotenv/config";

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

// Database
import connectDB from "./config/db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import chatStreamRouter from "./routes/chatStream.js";

const port = process.env.PORT || 3000;

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

// AI Chat Route
app.use(chatStreamRouter);

// Static uploads
const __dirname = path.resolve();

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Razorpay configuration
app.get("/api/config/razorpay", (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

app.listen(port, () => {
  console.log(`app is listening on port: ${port}`);
});