const express = require('express');
const router = express.Router();
const letterController = require('../controllers/letterController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Menggunakan middleware auth untuk semua routes
router.use(authenticateToken);

// Route untuk preview surat
router.post('/preview', letterController.preview);

// Route untuk generate PDF surat
router.post('/generate', letterController.generate);

// Route untuk menyimpan history surat
router.post('/history', letterController.saveHistory);

// Route untuk mendapatkan history surat
router.get('/history', letterController.getHistory);

// Route untuk download surat
router.get('/:id/download', letterController.downloadLetter);

// Route untuk preview template
router.post('/preview-template', letterController.previewTemplate);

module.exports = router;