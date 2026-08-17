import express from "express";
const router = express.Router();
import {
  createOrder,
  getAllOrders,
  getUsersOrder,
  countTotalOrders,
  calculateTotalSales,
  findOrderById,
  calcualteTotalSalesByDate,
  markOrderAsPaid,
  markOrderAsDelivered,
  createRazorpayOrder,
verifyRazorpayPayment
} from "../controllers/orderController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authmiddleware.js";
router
  .route("/")
  .post(authenticate, createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

router.route("/mine").get(authenticate, getUsersOrder);
router
  .route("/total-orders")
  .get(authenticate, authorizeAdmin, countTotalOrders);
router
  .route("/total-sales")
  .get(authenticate, authorizeAdmin, calculateTotalSales);
router.route("/total-sales-by-date").get(calcualteTotalSalesByDate);

router.post("/:id/razorpay", authenticate, createRazorpayOrder);

router.post(
  "/:id/razorpay/verify",
  authenticate,
  verifyRazorpayPayment
);
router.route("/:id").get(authenticate, authorizeAdmin, findOrderById);
router.route("/:id/pay").put(authenticate, markOrderAsPaid);
router
  .route("/:id/deliver")
  .put(authenticate, authorizeAdmin, markOrderAsDelivered);

export default router;
