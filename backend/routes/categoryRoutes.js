import express from "express";
const router = express.Router();
import { authenticate, authorizeAdmin } from "../middlewares/authmiddleware.js";
import { createCategory, updateCategory, removeCategory, allCategories, readCategory } from "../controllers/categoryController.js";

router.route("/").post(authenticate, authorizeAdmin, createCategory);
router.route("/:categoryId").put(authenticate, authorizeAdmin, updateCategory);
router.route("/:categoryId").delete(authenticate, authorizeAdmin, removeCategory);
router.route("/categories").get(allCategories);
router.route("/:id").get(readCategory);

export default router;
