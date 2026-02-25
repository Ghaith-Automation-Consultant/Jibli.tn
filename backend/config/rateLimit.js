const rateLimit = require('express-rate-limit');

// General api rate limiter
const apiLimiter = rateLimit({
    windowMs: 1000,//15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 10000 : 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Stricter rate limiting for authentication routes (Brute force protection)
const loginLimiter = rateLimit({
    windowMs: 1000,// 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 10000 : 5, // limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
    apiLimiter,
    loginLimiter
};
