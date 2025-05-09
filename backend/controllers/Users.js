const { Users } = require('../config/database');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'phone'],
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
}

exports.getUserById = async (req, res) => {
    try {
        // Use the authenticated user's ID from req.user
        console.log('getUserById called');
        console.log('Request user object:', req.user);
        
        const userId = req.user?.id;
        console.log('Fetching user info with ID:', userId);
        
        if (!userId) {
            console.error('No user ID available in the request');
            return res.status(401).json({ message: 'Not authenticated or missing user ID' });
        }
        
        const user = await Users.findByPk(userId);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user information:', error);
        res.status(500).json({ message: 'Failed to fetch personal information' });
    }
}

exports.createUser = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const newUser = await Users.create({
            name,
            phone,
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
}

exports.updateUser = async (req, res) => {
    try {
        // Use the authenticated user's ID from req.user instead of params
        const userId = req.user.id;
        const { name, phone } = req.body;
        
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update only name and phone (not email and password)
        user.name = name;
        user.phone = phone;
        
        await user.save();
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        });
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).json({ message: 'Failed to save personal information' });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        // Use the authenticated user's ID from req.user instead of params
        const userId = req.user.id;
        const user = await Users.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
}