import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

import {
    getAllUsers,
    getUserById,
    updateUserStatus,
    getAllContactMessages,
    updateMessageStatus
} from "../controllers/adminController.js";

const router = express.Router();

// Apply authentication and Admin authorization
router.use(authenticateToken);
router.use(authorizeRole("admin"));

// Admin-only test route
router.get(
    "/dashboard",

    (req, res) => {
        res.status(200).json({
            message: "Welcome to FinSight Admin Dashboard",
            user: req.user
        });
    }
);

// API 1- Get all users
router.get("/users", getAllUsers);

// API 2 - Get user by ID
router.get("/users/:id", getUserById);

// API 3 - Activate / Deactivate user
router.patch("/users/:id/status", updateUserStatus);

// API 3 - Get all contact messages
router.get("/messages", getAllContactMessages);

// Update Message Status API
router.patch("/messages/:id/status", updateMessageStatus);

export default router;


