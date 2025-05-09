// filepath: d:\Projects\ResumeBuilderV2\backend\routes\users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/Users');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// User routes
router.get('/', usersController.getAllUsers);
router.get('/me', usersController.getUserById); // Updated to get current user's info
router.put('/me', usersController.updateUser); // Updated to update current user's info
router.delete('/me', usersController.deleteUser); // Updated to delete current user

module.exports = router;