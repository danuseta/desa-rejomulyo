const express = require('express');
const router = express.Router();
const { controller, upload } = require('../controllers/villageController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Get village info
router.get('/', controller.getVillageInfo);

// Update village info
router.put('/', upload.single('signature'), controller.updateVillageInfo);

module.exports = router;