const jwt = require('jsonwebtoken');

const verifyTokenSignature = (req, res, next) => {
    // Extract token from "Authorization: Bearer <TOKEN>" header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 1. Check if token exists
    if (!token) {
        return res.status(401).json({ error: "Access denied. Token missing." });
    }

    // 2. Verify signature and expiration only
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err) => {
        if (err) {
            // Fails if token was tampered with, fake, or expired
            return res.status(403).json({ error: "Invalid or unsigned token." });
        }
        
        // Token is authentic and properly signed. Proceed to the route.
        next();
    });
};
