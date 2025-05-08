// filepath: d:\Projects\ResumeBuilderV2\backend\routes\skills.js
const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/Skills');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Skills routes
router.get('/', skillsController.getSkills);
router.post('/', skillsController.createSkills);
router.put('/:id', skillsController.updateSkills);
router.delete('/:id', skillsController.deleteSkills);

module.exports = router;