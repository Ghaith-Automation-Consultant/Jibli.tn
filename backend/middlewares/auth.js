const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // We expect the access_token in the cookies
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({ error: 'Access token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user payload
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        // If the token is expired, the client should call /refresh
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { authenticateToken };
