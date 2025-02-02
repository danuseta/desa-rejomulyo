const { verifyToken } = require('../utils/jwtUtils');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token autentikasi diperlukan' });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses tidak diizinkan' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
