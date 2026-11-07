import { sqlConnectionPool } from "../config/db.js";

export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [result] = await sqlConnectionPool.execute(
            `SELECT
                COALESCE(SUM(
                    CASE WHEN c.type = 'income'
                    THEN fr.amount ELSE 0 END
                ), 0) AS totalIncome,

                COALESCE(SUM(
                    CASE WHEN c.type = 'expense'
                    THEN fr.amount ELSE 0 END
                ), 0) AS totalExpenses

            FROM financial_records fr

            JOIN categories c
                ON fr.category_id = c.category_id

            WHERE fr.user_id = ?`,
            [userId]
        );

        const totalIncome = Number(result[0].totalIncome);
        const totalExpenses = Number(result[0].totalExpenses);

        const balance = totalIncome - totalExpenses;

        const netProfit = totalIncome - totalExpenses;

        const profitMargin = totalIncome > 0
            ? Number(((netProfit / totalIncome) * 100).toFixed(2))
            : 0;

        res.status(200).json({
            message: "Dashboard summary fetched successfully",
            totalIncome,
            totalExpenses,
            balance,
            netProfit,
            profitMargin
        });

    } catch (error) {
        console.error("Dashboard summary error:", error.message);

        return res.status(500).json({
            message: "Error fetching dashboard summary"
        });
    }
};

export const getMonthlySummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [monthlyData] = await sqlConnectionPool.execute(
            `SELECT
                DATE_FORMAT(fr.date, '%Y-%m') AS month,

                COALESCE(SUM(
                CASE WHEN c.type = 'income'
                THEN fr.amount ELSE 0 END
                ), 0) AS totalIncome,

                COALESCE(SUM(
                CASE WHEN c.type = 'expense'
                THEN fr.amount ELSE 0 END
                ), 0) AS totalExpenses

            FROM financial_records fr

            JOIN categories c
                ON fr.category_id = c.category_id

            WHERE fr.user_id = ?

            GROUP BY DATE_FORMAT(fr.date, '%Y-%m')

            ORDER BY month ASC`,
            [userId]
        );

        const monthlySummary = monthlyData.map((item) => ({
            month: item.month,
            totalIncome: Number(item.totalIncome),
            totalExpenses: Number(item.totalExpenses)
        }));

        res.status(200).json({
            message: "Monthly summary fetched successfully",
            monthlySummary
        });

    } catch (error) {
        console.error("Monthly summary error:", error.message);

        return res.status(500).json({
            message: "Error fetching monthly summary"
        });
    }
};

export const getRecentTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [transactions] = await sqlConnectionPool.query(
            `SELECT
                fr.record_id,
                fr.amount,
                fr.description,
                fr.date,
                c.name AS category_name,
                c.type AS category_type
            FROM financial_records fr
            JOIN categories c
                ON fr.category_id = c.category_id
            WHERE fr.user_id = ?
            ORDER BY fr.date DESC, fr.created_at DESC
            LIMIT 5`,
            [userId]
        );

        res.status(200).json({
            message: "Recent transactions fetched successfully",
            totalTransactions: transactions.length,
            transactions
        });

    } catch (error) {
        console.error("Recent transactions error:", error.message);

        return res.status(500).json({
            message: "Error fetching recent transactions"
        });
    }
};