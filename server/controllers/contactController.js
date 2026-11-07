import { sqlConnectionPool } from "../config/db.js";

// SUBMIT CONTACT MESSAGE
export const submitContactMessage = async (req, res) => {
    try{
        // 1. Get data from request body
        const {name, email, subject, message} = req.body;

        // 2. Validae required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // 3. Validate dta types 
        if (typeof name !== "string" ||
            typeof email != "string" ||
            typeof subject != "string" |
            typeof message != "string"
        ){
            return res.status(400).json({
                message: "Invalid input format"
            });
        }

        // 4. Normalize input 
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();

        // 5. Validate empty values
        if (!cleanName || !cleanSubject || !cleanMessage) {
            return res.status(400).json({
                message: "Fields cannot conatin only spaces"
            });
        }

        // 6. Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(cleanEmail)){
            return res.status(400).json({
                message: "Invalid email address"
            });
        }

        // 7. Insert message into database
        const [result] = await sqlConnectionPool.execute(
            `INSERT INTO contact_messages
            (name, email, subject, message, status)
            VALUES ( ?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                cleanSubject,
                cleanMessage,
                "new"
            ]
        );

        // 8. Send response
        return res.status(201).json({
            message: "Contact message submitted successfully",
            
            contactMessages: {
                id: result.insertId,
                name: cleanName,
                email: cleanEmail,
                subject: cleanSubject,
                status: "new"
            }
        });

    } catch (error) {
        console.error("Contact Message Error", error.message);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }

};