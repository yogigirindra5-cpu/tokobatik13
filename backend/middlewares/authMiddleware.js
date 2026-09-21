const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware untuk memverifikasi token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }
    req.user = decoded; // { id, email, role }
    next();
  });
};

// Middleware untuk membatasi akses hanya untuk role tertentu
const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke resource ini' });
    }
    next();
  };
};

module.exports = { verifyToken, verifyRole };