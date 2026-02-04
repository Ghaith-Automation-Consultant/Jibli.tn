const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const SALT_ROUNDS = 10;

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user info (without password) and token
        // Mongoose document to object
        const userObj = user.toJSON();
        const { password: _, ...userWithoutPassword } = userObj;
        res.json({
            user: {
                ...userWithoutPassword,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.register = async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create new user
        const newUser = {
            email,
            name,
            location: "Tunis, Tunisie", // Default for now
            password: hashedPassword
        };

        const createdUser = await User.create(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { id: createdUser._id, email: createdUser.email, name: createdUser.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user info (without password) and token
        const userObj = createdUser.toJSON();
        const { password: _, ...userWithoutPassword } = userObj;
        res.status(201).json({
            user: {
                ...userWithoutPassword,
                token
            },
            message: "Registration successful"
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUser = async (req, res) => {
    try {
        if (!req.params.id) {
            console.error("getUser error: No ID provided");
            return res.status(400).json({ error: 'User ID required' });
        }

        // Handle "me" literal just in case it slips through specific route or if logic is reused
        let userId = req.params.id;
        if (userId === 'me') {
            if (!req.user) return res.status(401).json({ error: 'Unauthorized for /me' });
            userId = req.user.id;
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error(`getUser error: User not found for ID ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        const userObj = user.toJSON();
        const { password: _, ...userWithoutPassword } = userObj;

        // Privacy Check
        // If the requester is NOT the user themselves (and not an admin)
        if (!req.user || req.user.id !== userId) {
            // Return only public info
            const publicUser = {
                id: userWithoutPassword.id,
                name: userWithoutPassword.name,
                avatar: userWithoutPassword.avatar,
                location: userWithoutPassword.location,
                bio: userWithoutPassword.bio,
                languages: userWithoutPassword.languages,
                isEmailVerified: userWithoutPassword.isEmailVerified,
                isPhoneVerified: userWithoutPassword.isPhoneVerified,
                isIdentityVerified: userWithoutPassword.isIdentityVerified,
                reviews: userWithoutPassword.reviews,
                createdAt: userWithoutPassword.createdAt
            };
            return res.json(publicUser);
        }

        // If it is the user, return everything
        res.json(userWithoutPassword);
    } catch (error) {
        console.error("Get User Error:", error.message, error.stack);
        // Check for CastError which implies invalid ID format
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid User ID format' });
        }
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        // Security: Ensure user is updating themselves
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Unauthorized to update this profile' });
        }

        const updateData = { ...req.body };

        // Prevent updating sensitive fields manually
        delete updateData.isEmailVerified; // Should be handled by verification process
        delete updateData.isPhoneVerified;
        delete updateData.isIdentityVerified;
        delete updateData.reviews; // Reviews are added, not edited by user directly here

        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        // Don't send password
        const userObj = updatedUser.toJSON();
        const { password: _, ...userWithoutPassword } = userObj;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMe = async (req, res) => {
    // Redirect to getUser with the authenticated user's ID
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.params.id = req.user.id;
    return exports.getUser(req, res);
};

exports.updateMe = async (req, res) => {
    req.params.id = req.user.id;
    return exports.updateUser(req, res);
};
