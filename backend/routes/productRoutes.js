import express from "express";
import formidable from "express-formidable";
const router = express.Router();
import {
  addProduct,
  editProduct,
  removeProduct,
  fetchProducts,
  fetchById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts
} from "../controllers/productController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authmiddleware.js";
import checkId from "../middlewares/checkId.js";

router
  .route("/")
  .get(fetchProducts)
  .post(authenticate, authorizeAdmin, formidable(), addProduct);

router.route("/allProducts").get(fetchAllProducts);

router.get("/top",fetchTopProducts);
router.get("/new",fetchNewProducts);

router
  .route("/:id/reviews")
  .post(authenticate,  checkId, addProductReview);

router
  .route("/:id")
  .get(fetchById)
  .put(authenticate, authorizeAdmin, formidable(), editProduct)
  .delete(authenticate, authorizeAdmin, removeProduct);

router.route("/filtered-products").post(filterProducts);  

export default router;
