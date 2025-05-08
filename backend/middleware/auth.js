// filepath: d:\Projects\ResumeBuilderV2\backend\middleware\auth.js
const jwt = require('jsonwebtoken');
const { Users } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by id
    const user = await Users.findByPk(decoded.id);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'User not found, authentication failed' });
    }
    
    // Set user in request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = authMiddleware;