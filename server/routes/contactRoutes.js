import express from "express";

import {
    submitContactMessage
} from "../controllers/contactController.js";

const router = express.Router();

// Submit Contact Message 
router.post("/", submitContactMessage);

export default router;

