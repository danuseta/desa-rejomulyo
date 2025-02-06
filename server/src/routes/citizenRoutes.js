const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const citizenController = require('../controllers/citizenController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/temp'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.xlsx' && ext !== '.xls') {
            return cb(new Error('Only Excel files are allowed'));
        }
        cb(null, true);
    }
});

// Penting: route /search harus di atas route /:id
router.get('/search', authenticateToken, citizenController.searchCitizens);

// Basic CRUD routes dengan role checking
router.get('/', authenticateToken, citizenController.getCitizens);
router.get('/statistics', authenticateToken, citizenController.getStatistics);
router.get('/total-families', authenticateToken, citizenController.getTotalFamilies);
router.get('/kk/:noKK', authenticateToken, citizenController.getCitizensByKK);
router.get('/template', authenticateToken, citizenController.downloadTemplate);
router.get('/:id', authenticateToken, citizenController.getCitizenById);
router.get('/warning/data', authenticateToken, citizenController.getWarningData);

// Routes yang membutuhkan role super_admin
router.post('/', authenticateToken, authorizeRole(['super_admin']), citizenController.createCitizen);
router.post('/import', authenticateToken, authorizeRole(['super_admin']), upload.single('file'), citizenController.importCitizens);
router.put('/:id', authenticateToken, authorizeRole(['super_admin']), citizenController.updateCitizen);
router.delete('/:id', authenticateToken, authorizeRole(['super_admin']), citizenController.deleteCitizen);

module.exports = router;