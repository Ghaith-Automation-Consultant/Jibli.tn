const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Validation failed' });
        }

        // Basic password complexity validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Password must be at least 12 characters long and include an uppercase letter, lowercase letter, number, and special character.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        // Hash password with Argon2id
        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536, // 64 MB
            timeCost: 3,
            parallelism: 4
        });

        const user = new User({
            email: email.toLowerCase(),
            password: passwordHash,
            name
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully. Please login.' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Timing attack mitigation: always run a hash verification even if user doesn't exist
        if (!user) {
            await argon2.verify('$argon2id$v=19$m=65536,t=3,p=4$dummySalt$dummyHash', password).catch(() => { });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check for account lockout
        if (user.lockedUntil && user.lockedUntil > Date.now()) {
            return res.status(403).json({ error: `Account is temporarily locked. Try again later.` });
        }

        const isValidPassword = await argon2.verify(user.password, password);

        if (!isValidPassword) {
            // Increment failed login attempts
            let updatePayload = { $inc: { failedLoginAttempts: 1 } };
            if (user.failedLoginAttempts + 1 >= 10) {
                updatePayload.$set = { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) };
            }
            await User.updateOne({ _id: user._id }, updatePayload);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset failed login attempts on success
        if (user.failedLoginAttempts > 0) {
            await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0 }, $unset: { lockedUntil: 1 } });
        }

        // 1. Generate Access Token (JWT)
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // 2. Generate Refresh Token (Opaque)
        const rawRefreshToken = crypto.randomBytes(64).toString('hex');
        const hashedRefreshToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

        // Store hash in DB
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await RefreshToken.create({
            userId: user._id,
            tokenHash: hashedRefreshToken,
            expiresAt,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // 3. Set Cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refresh_token', rawRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/api/auth/refresh',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, name: user.name }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const refresh = async (req, res) => {
    try {
        const rawRefreshToken = req.cookies?.refresh_token;

        if (!rawRefreshToken) {
            return res.status(401).json({ error: 'Refresh token missing' });
        }

        const hashedRefreshToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

        const tokenRecord = await RefreshToken.findOne({ tokenHash: hashedRefreshToken }).populate('userId');

        if (!tokenRecord) {
            // Token does not exist. The client might be trying to reuse a rotated token.
            // In a strict implementation, we would extract the user ID somehow (maybe from expired access token or decode logic if we made it a JWT) 
            // and revoke all their sessions. Here we just reject.
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        if (tokenRecord.isRevoked) {
            // Token theft detected!
            console.warn(`Token theft detected for user ${tokenRecord.userId._id}`);
            await RefreshToken.updateMany({ userId: tokenRecord.userId._id }, { $set: { isRevoked: true } });
            return res.status(403).json({ error: 'Token revoked. All sessions terminated.' });
        }

        if (tokenRecord.expiresAt < new Date()) {
            return res.status(403).json({ error: 'Refresh token expired' });
        }

        const user = tokenRecord.userId;

        // --- Token Rotation ---
        // 1. Invalidate old refresh token
        await RefreshToken.deleteOne({ _id: tokenRecord._id });

        // 2. Generate new Access Token
        const newAccessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // 3. Generate new Refresh Token
        const newRawRefreshToken = crypto.randomBytes(64).toString('hex');
        const newHashedRefreshToken = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');

        await RefreshToken.create({
            userId: user._id,
            tokenHash: newHashedRefreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // 4. Update Cookies
        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refresh_token', newRawRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/api/auth/refresh',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: 'Token refreshed successfully' });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const logout = async (req, res) => {
    try {
        const rawRefreshToken = req.cookies?.refresh_token;

        if (rawRefreshToken) {
            const hashedRefreshToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
            await RefreshToken.deleteOne({ tokenHash: hashedRefreshToken });
        }

        res.cookie('access_token', '', { expires: new Date(0), httpOnly: true, sameSite: 'Strict' });
        res.cookie('refresh_token', '', { expires: new Date(0), httpOnly: true, sameSite: 'Strict', path: '/api/auth/refresh' });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout
};
