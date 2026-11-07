import express from "express";

import {
  getDashboardSummary,
  getMonthlySummary,
  getRecentTransactions
} from "../controllers/dashboardController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/summary", authenticateToken, getDashboardSummary);

router.get("/monthly-summary", authenticateToken, getMonthlySummary);

router.get("/recent-transactions", authenticateToken, getRecentTransactions);

export default router;