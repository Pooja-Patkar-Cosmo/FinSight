import { sqlConnectionPool } from "../config/db.js";

// Get all categories
export const getCategories = async (req, res) => {

    try {

        const { type } = req.query;

        let query = `
            SELECT category_id, name, type
            FROM categories
            WHERE is_active = TRUE
        `;

        const values = [];

        // Filter by category type
        if (type) {

            const categoryType = type.toLowerCase();

            if (!["income", "expense"].includes(categoryType)) {
                return res.status(400).json({
                    message: "Invalid category type"
                });
            }

            query += " AND type = ?";
            values.push(categoryType);

        }

        query += " ORDER BY name ASC";

        const [categories] = await sqlConnectionPool.execute(
            query,
            values
        );

        return res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });

    } catch (error) {

        console.error("Category Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};