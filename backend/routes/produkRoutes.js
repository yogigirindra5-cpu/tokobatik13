const express = require('express');
const router = express.Router();
const {
  getAllProduk, getProdukById, createProduk, updateProduk, deleteProduk
} = require('../controllers/produkController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// Publik: siapa saja bisa lihat produk
router.get('/', getAllProduk);
router.get('/:id', getProdukById);

// Khusus admin: tambah, update, hapus produk
router.post('/', verifyToken, verifyRole('admin'), upload.single('gambar'), createProduk);
router.put('/:id', verifyToken, verifyRole('admin'), upload.single('gambar'), updateProduk);
router.delete('/:id', verifyToken, verifyRole('admin'), deleteProduk);

module.exports = router;