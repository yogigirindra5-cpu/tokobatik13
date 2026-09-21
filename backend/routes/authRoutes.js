const express = require('express');
const router = express.Router();
const {
  register, login, getProfile, updateProfile, getAllUsers,
  createUserAdmin, updateUserAdmin, deleteUserAdmin
} = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

console.log('--- Cek authController ---');
console.log('register:', typeof register);
console.log('login:', typeof login);
console.log('getProfile:', typeof getProfile);
console.log('getAllUsers:', typeof getAllUsers);
console.log('createUserAdmin:', typeof createUserAdmin);
console.log('updateUserAdmin:', typeof updateUserAdmin);
console.log('deleteUserAdmin:', typeof deleteUserAdmin);

console.log('--- Cek authMiddleware ---');
console.log('verifyToken:', typeof verifyToken);
console.log('verifyRole:', typeof verifyRole);

console.log('--- Cek multer ---');
console.log('upload:', typeof upload);
console.log('upload.single:', typeof upload?.single);

router.post('/register', upload.single('foto'), register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/users', verifyToken, verifyRole('admin'), getAllUsers);
router.post('/users', verifyToken, verifyRole('admin'), createUserAdmin);
router.put('/users/:id', verifyToken, verifyRole('admin'), updateUserAdmin);
router.delete('/users/:id', verifyToken, verifyRole('admin'), deleteUserAdmin);

module.exports = router;