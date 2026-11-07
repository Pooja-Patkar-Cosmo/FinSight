import { sqlConnectionPool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try{
        const {name, email, password } = req.body;

        //1. Validate input ----------------------------------------------
        if(!name || !email || !password){
            return res.status(400).json({
                message: " All fields are required"
            });
        }

        if (password.length < 8){
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        //2. Check whether email already exists ---------------------------
        const[existingUser] = await sqlConnectionPool.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUser.length>0){
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // 3. Hash Password ------------------------------------
        const hashedPasssword = await bcrypt.hash(password, 10);

        // 4. Insert user into database ----------------------
        const [result] = await sqlConnectionPool.execute(
            `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
            [name.trim(), normalizedEmail, hashedPasssword]
        );

        // 5. Send response
        return res.status(201).json({
            message: "Registration successful",
            user: {
                user_id: result.insertId,
                name: name.trim(),
                email: normalizedEmail,
                role: "user"
            }
        });


    }catch(error){
        console.error("Registration Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};

// Login API
export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        //1. Validate input ----------------------------------------
        if (!email || !password){
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 2. Find user in database ------------------------------------
        const [users] = await sqlConnectionPool.execute(
            `SELECT user_id, name, email, password_hash, role, is_active
            FROM users
            WHERE email = ?`,
            [normalizedEmail]
        );

        if(users.length === 0){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // 3. Check whether account is active ---------------------------------
        if(!user.is_active) {
            return res.status(403).json({
                message: 'Your account is inactive'
            });
        }

        // 4. Compare entered password with stored hash -------------------------------
        const isPasswordValid = await bcrypt.compare(
            password, 
            user.password_hash
        );

        if (!isPasswordValid){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 5. Genearte JWT --------------------------------------------------------
        const token = jwt.sign(
            {
                userId : user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:  process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        // 6. Send successful response ---------------------------------------------
        return res.status(200).json({
            message: "Login successful",
            token: token,

            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role : user.role
            }
        });

    }catch(error){
        console.error("Login Error:", error.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};
