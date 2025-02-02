const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const citizenController = require('../controllers/citizenController');
const { authMiddleware } = require('../middlewares/authMiddleware');

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
router.get('/search', citizenController.searchCitizens);

// Basic CRUD routes
router.get('/', citizenController.getCitizens);
router.get('/statistics', citizenController.getStatistics);
router.get('/total-families', citizenController.getTotalFamilies);
router.get('/kk/:noKK', citizenController.getCitizensByKK);
router.get('/template', citizenController.downloadTemplate);
router.get('/:id', citizenController.getCitizenById);

router.post('/', citizenController.createCitizen);
router.post('/import', upload.single('file'), citizenController.importCitizens);

router.put('/:id', citizenController.updateCitizen);
router.delete('/:id', citizenController.deleteCitizen);

// Tambahkan route baru
router.get('/warning/data', citizenController.getWarningData);

module.exports = router;