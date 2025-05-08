// filepath: d:\Projects\ResumeBuilderV2\backend\routes\projects.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/Project');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Project routes
router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;