const express = require('express');
const router = express.Router();
const { controller, upload } = require('../controllers/templateController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Routes tanpa upload
router.get('/', controller.getTemplates);
router.get('/:id', controller.getTemplateById);
router.delete('/:id', controller.deleteTemplate);

// Routes dengan upload
router.post('/', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: err.field === 'logo' ? 
            'Ukuran logo tidak boleh lebih dari 2MB' : 
            'Ukuran file template tidak boleh lebih dari 10MB'
        });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, controller.createTemplate);

router.put('/:id', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: err.field === 'logo' ? 
            'Ukuran logo tidak boleh lebih dari 2MB' : 
            'Ukuran file template tidak boleh lebih dari 10MB'
        });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, controller.updateTemplate);

router.get('/letter-templates/:id/file', controller.getTemplateFile);

module.exports = router;