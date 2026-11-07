import "dotenv/config";

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import recordRoutes from "./routes/recordRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

import { sqlConnectionPool } from "./config/db.js";

const app = express();

// route configurations
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);




app.get("/", (req, res) => {
    res.send("FinSight API is running!");
});

// Testing database connection
async function startServer() {
    try {
        const connection = await sqlConnectionPool.getConnection();

        console.log("MySQL Database Connected Successfully!");

        connection.release();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.log("Database Connection Failed:", error.message);
    }
}

startServer();