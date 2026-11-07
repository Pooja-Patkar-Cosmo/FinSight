import { sqlConnectionPool } from "../config/db.js";

// CREATE FINANCIAL RECORD
export const createRecord = async (req, res) => {

    try {

        // 1. Get data from request body
        const { category_id, amount, description, date } = req.body;

        // Get logged-in user's ID from JWT
        const userId = req.user.userId;

        // 2. Validate input
        if (!category_id || !amount || !description || !date) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        if (!Number.isInteger(Number(category_id)) ||
            Number(category_id) <= 0 ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0) {

            return res.status(400).json({
                message: "Invalid category or amount"
            });

        }

        // 3. Validate date format and calendar date
        const validDate =
            /^\d{4}-\d{2}-\d{2}$/.test(date) &&
            !Number.isNaN(Date.parse(date)) &&
            new Date(date).toISOString().slice(0, 10) === date;

        if (!validDate) {
            return res.status(400).json({
                message: "Invalid date. Use YYYY-MM-DD format"
            });
        }

        // 4. Check whether category exists and is active
        const [categories] = await sqlConnectionPool.execute(
            `SELECT category_id
             FROM categories
             WHERE category_id = ? AND is_active = TRUE`,
            [category_id]
        );

        if (categories.length === 0) {

            return res.status(404).json({
                message: "Category not found or inactive"
            });

        }

        // 5. Insert financial record into database
        const [result] = await sqlConnectionPool.execute(
            `INSERT INTO financial_records
            (user_id, category_id, amount, description, date)
            VALUES (?, ?, ?, ?, ?)`,
            [
                userId,
                category_id,
                amount,
                description.trim(),
                date
            ]
        );

        // 6. Send response
        return res.status(201).json({

            message: "Financial record created successfully",

            record: {
                record_id: result.insertId,
                user_id: userId,
                category_id,
                amount,
                description,
                date
            }

        });

    } catch (error) {

        console.error("Create Record Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};

// GET ALL FINANCIAL RECORDS 
export const getAllRecords = async (req, res) => {
    try{
        //Get logged-in user's ID
        const userId = req.user.userId;

        // Fetch user's financial records
        const [records] = await sqlConnectionPool.execute(
            `SELECT 
                fr.record_id,
                fr.user_id,
                fr.category_id,
                c.name AS category_name,
                c.type AS category_type,
                fr.amount,
                fr.description,
                fr.date
                
            FROM financial_records fr

            JOIN categories c
                ON fr.category_id = c.category_id
                
            WHERE fr.user_id = ?
            
            ORDER BY fr.date DESC`,

            [userId]
        );

        return res.status(200).json({
            message: "Financial records fetched successfully",
            
            totalRecords: records.length,

            records: records
        });



    } catch (error) {
        console.error("Fetch Records Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Function 4 - GET RECORD BY ID
export const getRecordById = async (req, res) => {

    try{

        // 1. Get record ID from URL
        const {id} = req.params;

        // 2. Get logged-in users's ID from JWT
        const userId = req.user.userId;

        // 3. Validate record Id
        if (!/^[1-9]\d*$/.test(id)) {

            return res.status(400).json({
                message: "Invalid record ID"
            });

        }

        // 4. Fetch record from database
        const [records] = await sqlConnectionPool.execute(

            `SELECT 
                fr.record_id,
                fr.user_id,
                fr.category_id,
                c.name AS category_name,
                c.type AS category_type,
                fr.amount,
                fr.description,
                fr.date
                
            FROM financial_records fr
            
            JOIN categories c
                ON fr.category_id = c.category_id
                
            WHERE fr.record_id = ?
            AND fr.user_id = ?`,

            [id, userId]
        );

        // 5. Check whether record exists 
        if(records.length === 0) {
            return res.status(404).json({
                message: "Financial record not found"
            });
        }

        // 6. Return record
        return res.status(200).json({
            message: "Financial record fetched successfully",

            record: records[0]
        });

    } catch (error) {
        console.error("Get Record Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// API 5 : UPDATE FINANCIAL RECORD
export const updateRecord = async (req, res) => {
    try{
        // 1. Get record ID from URL 
        const {id} = req.params;

        // 2. Get updated data from request body
        const { category_id, amount ,description, date } = req.body;

        // 3. Get logged-in user's ID
        const userId= req.user.userId;

        // 4. Validae record ID
         if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid record ID"
            });
        }

        // 5. VAlidae input
        if (!category_id || !amount || !description || !date) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (
            !Number.isInteger(Number(category_id)) ||
            Number(category_id) <= 0 ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                message : "Invalid category or amount"
            });
        }

        if (typeof description != "string" || !description.trim()) {
            return res.status(400).json({
                message: "Description is required"
            });
        }

        // 6. Validate date
        const validDate =
            typeof date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(date) &&
            !Number.isNaN(Date.parse(date)) &&
            new Date(date).toISOString().slice(0, 10) === date;

        if (!validDate) {
            return res.status(400).json({
                message: "Invalid date. Use YYYY-MM-DD"
            });
        }

        // 7. Check whether record belongs to logged-in user
        const [existingRecord] = await sqlConnectionPool.execute(
            `SELECT record_id
             FROM financial_records
             WHERE record_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({
                message: "Financial record not found"
            });
        }

        // 8. Check whether category exists and is active
        const [categories] = await sqlConnectionPool.execute(
            `SELECT category_id
             FROM categories
             WHERE category_id = ? AND is_active = TRUE`,
            [category_id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Category not found or inactive"
            });
        }


        // 9. Update record
        await sqlConnectionPool.execute(
            `UPDATE financial_records 
            SET category_id = ?,
            amount = ?,
            description = ?,
            date = ?
            WHERE record_id = ? AND user_id = ?`,
            [
                category_id,
                amount,
                description.trim(),
                date,
                id,
                userId
            ]
        );

        // 10. Send response
        return res.status(200).json({
            message: "Financial record updated successfully"
        });
       

    } catch (error) {
        console.error("Updated Record Error:", error.message);
        
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


// API 6 - DELETE RECORD API
export const deleteRecord = async (req, res) => {
    try{
        // 1. Get record ID from URL
        const { id } = req.params;

        // 2. Get logged-in user's ID
        const userId = req.user.userId;

        // 3. Validate record ID
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid record ID"
            });
        }

        // 4. Check whether record belongs to logged-in user
        const [existingRecord] = await sqlConnectionPool.execute(
            `SELECT record_id
             FROM financial_records
             WHERE record_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({
                message: "Financial record not found"
            });
        }

        // 5. Delete record 
        await sqlConnectionPool.execute(
            `DELETE FROM financial_records
            WHERE record_id = ? AND user_id = ?`,
            [id, userId]
        );

        // 6. Send response
        return res.status(200).json({
            message: "Financial record deleted successfully"
        });

    } catch (error) {
        console.error("Delete Record Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};
