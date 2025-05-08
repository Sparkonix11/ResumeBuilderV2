// filepath: d:\Projects\ResumeBuilderV2\backend\routes\achievements.js
const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/Achievement');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Achievement routes
router.get('/', achievementController.getAchievements);
router.post('/', achievementController.createAchievement);
router.put('/:id', achievementController.updateAchievement);
router.delete('/:id', achievementController.deleteAchievement);

module.exports = router;