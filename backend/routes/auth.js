// filepath: d:\Projects\ResumeBuilderV2\backend\routes\auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;