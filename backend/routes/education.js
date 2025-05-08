// filepath: d:\Projects\ResumeBuilderV2\backend\routes\education.js
const express = require('express');
const router = express.Router();
const educationController = require('../controllers/Education');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Education routes
router.get('/', educationController.getEducation);
router.post('/', educationController.createEducation);
router.get('/:id', educationController.getEducationById);
router.put('/:id', educationController.updateEducation);
router.delete('/:id', educationController.deleteEducation);

module.exports = router;