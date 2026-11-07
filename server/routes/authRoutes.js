import express from "express";
import {authenticateToken} from "../middleware/authMiddleware.js";

import { registerUser,
    loginUser
} from "../controllers/authController.js";

const router = express.Router();

// Registration API
router.post("/register", registerUser);

// Login API
router.post("/login", loginUser);

// Get logged-in user details
router.get("/me", authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Authenticated user",
        user: req.user
    });
})


export default router;



