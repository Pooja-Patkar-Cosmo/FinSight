import express from "express";

import { getCategories } from "../controllers/categoryController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all categories
router.get("/", authenticateToken, getCategories);

export default router;