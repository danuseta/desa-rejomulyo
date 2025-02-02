const express = require('express');
const { login, register, getMe, updatePassword, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, updatePassword);

module.exports = router;