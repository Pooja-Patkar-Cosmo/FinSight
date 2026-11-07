import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    try{
        //1. Get token from request header
        const authHeader = req.headers.authorization;

        // 2. Check whether token exists
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Token required."
            });
        }

        // 3. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 4. Store decoded user details in request
        req.user = decoded;

        // 5. Continue to next middleware/controller
        next();
    }catch(error){
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }

}