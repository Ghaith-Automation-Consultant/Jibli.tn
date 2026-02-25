const User = require('../models/User');
const argon2 = require('argon2');

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching user profile' });
    }
};

const updateMe = async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password; // Don't allow password updates here

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating profile' });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -isEmailVerified -isPhoneVerified -isIdentityVerified');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching user' });
    }
};

const updateUser = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Unauthorized to update this user' });
        }

        const updates = req.body;
        delete updates.password; // Don't allow password updates

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Unauthorized to delete this user' });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting user' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'L\'ancien et le nouveau mot de passe sont requis' });
        }
        if (newPassword.length < 12) {
            // OWASP standard used in auth
            return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 12 caractères.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const isValid = await argon2.verify(user.password, oldPassword);
        if (!isValid) {
            return res.status(401).json({ error: 'L\'ancien mot de passe est incorrect' });
        }

        const newPasswordHash = await argon2.hash(newPassword, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4
        });

        user.password = newPasswordHash;
        await user.save();

        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ error: 'Erreur serveur lors du changement de mot de passe' });
    }
};

module.exports = {
    getMe,
    updateMe,
    getUser,
    updateUser,
    deleteUser,
    changePassword
};
