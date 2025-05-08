// filepath: d:\Projects\ResumeBuilderV2\backend\routes\links.js
const express = require('express');
const router = express.Router();
const linksController = require('../controllers/Links');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Links routes
router.get('/', linksController.getLinks);
router.post('/', linksController.createLinks);
router.put('/:id', linksController.updateLinks);
router.delete('/:id', linksController.deleteLinks);

module.exports = router;