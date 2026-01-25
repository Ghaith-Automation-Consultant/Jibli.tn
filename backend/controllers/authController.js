const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const SALT_ROUNDS = 10;

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const users = db.getAll('users');
        const user = users.find(u => u.email === email);

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
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user info (without password) and token
        const { password: _, ...userWithoutPassword } = user;
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
        const users = db.getAll('users');
        const existingUser = users.find(u => u.email === email);

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

        const createdUser = db.add('users', newUser);

        // Generate JWT token
        const token = jwt.sign(
            { id: createdUser.id, email: createdUser.email, name: createdUser.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user info (without password) and token
        const { password: _, ...userWithoutPassword } = createdUser;
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

exports.getUser = (req, res) => {
    const users = db.getAll('users');
    const user = users.find(u => u.id == req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Don't send password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
};

exports.updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
        }

        const updatedUser = db.update('users', req.params.id, updateData);
        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        // Don't send password
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteUser = (req, res) => {
    const success = db.remove('users', req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
};
