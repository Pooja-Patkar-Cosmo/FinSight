import express from "express";

import { 
    createRecord,
    getAllRecords,
    getRecordById,
    updateRecord,
    deleteRecord
 } from "../controllers/recordController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Financial Record
router.post("/", authenticateToken, createRecord);

// Get all financial records
router.get("/", authenticateToken, getAllRecords);

// Get record by Id
router.get("/:id", authenticateToken, getRecordById);

// Update record
router.put("/:id", authenticateToken, updateRecord);

// Delete record
router.delete("/:id", authenticateToken, deleteRecord);

export default router;