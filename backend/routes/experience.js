// filepath: d:\Projects\ResumeBuilderV2\backend\routes\experience.js
const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/Experience');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Experience routes
router.get('/', experienceController.getExperience);
router.post('/', experienceController.createExperience);
router.get('/:id', experienceController.getExperienceById);
router.put('/:id', experienceController.updateExperience);
router.delete('/:id', experienceController.deleteExperience);

module.exports = router;