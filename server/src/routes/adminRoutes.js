const express = require('express');
const { 
  getAdmins, 
  getAdmin, 
  createAdmin, 
  updateAdmin, 
  deleteAdmin 
} = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes - require authentication and super_admin role
router.use(authenticateToken);
router.use(authorizeRole(['super_admin']));

// Route definitions
router.get('/users', getAdmins);
router.get('/users/:id', getAdmin);
router.post('/users', createAdmin);
router.put('/users/:id', updateAdmin);
router.delete('/users/:id', deleteAdmin);

module.exports = router;