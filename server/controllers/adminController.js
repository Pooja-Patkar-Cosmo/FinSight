import { sqlConnectionPool } from "../config/db.js";

// API 1 - GET ALL USERS 
export const getAllUsers = async (req, res) => {
    try{
        const [users] = await sqlConnectionPool.execute(
            `SELECT 
                user_id, 
                name, 
                email, 
                role,
                is_active
            FROM users
            ORDER BY user_id DESC`
        );

        return res.status(200).json({
            message: "Users fetched successfully",
            totalUsers: users.length,
            users
        });

    } catch(error) {
        console.error("Get Users Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }

};

// API 2 -GET USERS DETAILS BY ID
export const getUserById = async (req, res) => {
    try {
        // 1. Get user Id from URL
        const {id} = req.params;

        // 2. Validate ID
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        // 3. Fetch user
        const [users] = await sqlConnectionPool.execute(
            `SELECT 
                user_id,
                name,
                email,
                role,
                is_active 
                FROM users
                WHERE user_id = ?`,
                [id]
        );
        
        // 4. Check user exists
        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 5. Send response
        return res.status(200).json({
            message: "User details fetched successfully",
            user: users[0]
        });

    } catch(error) {
        console.error("Get User Error:", error.message);

        return res.status(500).json({
            message:  "Internal Server Error"
        });
    }

};

// ACTIVATE / DEACTIVATE USER
export const updateUserStatus = async (req, res) => {
    try{
        // 1. Get user ID
        const {id} = req.params;

        // 2. Get status from request body
        const {is_active} = req.body;

        // 3. Validate ID
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        // 4. Validate status
        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message: "is_active must be true or false"
            });

        }

        // 5. Prevent admin from deactivating their own account
        if (Number(id) === Number(req.user.userId)){
            return res.status(400).json({
                message: "You cannot deactivate your own account, as you are the Admin"
            });
        }

        // 6. Check whether user exists
        const [users] = await sqlConnectionPool.execute(
            `SELECT user_id FROM users WHERE user_id = ?`,
            [id]
        );

        if (users.length === 0){
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 7. Update user status
        await sqlConnectionPool.execute(
            `UPDATE users
            SET is_active = ?
            WHERE user_id = ?`,
            [is_active, id]
        );

        // 8. Send respone
        return res.status(200).json({
            message: is_active
            ? "User activated successfully"
            : "User deactivated successfully"
        });

    } catch(error) {
        console.error("Update User Status Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }

};

// GET ALL CONTACT MESSAGES
export const getAllContactMessages = async (req, res) => {
    try{

        const [messages ] = await sqlConnectionPool.execute(
        `SELECT * FROM contact_messages`
    );

    return res.status(200).json({
        message: "Contact messages fetched successfully",
        totalMessages: messages.length,
        messages
    });

    } catch (error) {
        console.error("Get Messages Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// UPDATE CONTACT MESSAGES STATUS
export const updateMessageStatus = async (req, res) => {
    try{

        // 1. Get message ID from URL
        const {id} = req.params;

        // 2. Get status from request body
        const {status} = req.body;

        // 3. Validate message ID 
        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid message ID"
            });
        }

        // 4. Validate status
        if (!["new", "read"].includes(status)) {
            return res.status(400).json({
                message: "Status must be either new or read"
            });
        }

        // 5. Check whether message exists
        const [messages] = await sqlConnectionPool.execute(
            `SELECT message_id
            FROM contact_messages 
            WHERE message_id = ?`,
            [id]
        );

        if (messages.length === 0) {
            return res.status(404).json({
                messages: "Contact message not found"
            });
        }

        // 6. Update message status
        await sqlConnectionPool.execute(
            `UPDATE contact_messages
            SET status = ?
            WHERE message_id = ?`,
            [status, id]
        );

        // 7. Send success response
        return res.status(200).json({
            message: "Contact message status updated successfully",
            message_id: Number(id),
            status: status
        });

    } catch (error) {
        console.error("Update Message Status Error", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};