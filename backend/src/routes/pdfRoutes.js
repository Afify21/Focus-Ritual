const express = require('express');
const router = express.Router();
const { uploadPDF, getPDF, deletePDF } = require('../controllers/pdfController');

// PDF routes
router.post('/upload', uploadPDF);
router.get('/:filename', getPDF);
router.delete('/:filename', deletePDF);

module.exports = router; 