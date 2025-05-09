const express = require('express');
const router = express.Router();
const latexController = require('../controllers/LaTeX');
const authMiddleware = require('../middleware/auth');

// Generate PDF from LaTeX
router.post('/generate-pdf', authMiddleware, latexController.generatePDF);

// Validate LaTeX code without generating PDF
router.post('/validate', authMiddleware, latexController.validateLaTeX);

module.exports = router;