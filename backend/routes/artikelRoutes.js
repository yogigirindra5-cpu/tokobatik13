const express = require('express');
const router = express.Router();
const {
  getAllArtikel, getArtikelById, createArtikel, updateArtikel, deleteArtikel
} = require('../controllers/artikelController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// GET /api/artikel - publik
router.get('/', getAllArtikel);

// GET /api/artikel/:id - publik
router.get('/:id', getArtikelById);

// POST /api/artikel - hanya admin
router.post('/', verifyToken, verifyRole('admin'), upload.single('gambar'), createArtikel);

// PUT /api/artikel/:id - hanya admin
router.put('/:id', verifyToken, verifyRole('admin'), upload.single('gambar'), updateArtikel);

// DELETE /api/artikel/:id - hanya admin
router.delete('/:id', verifyToken, verifyRole('admin'), deleteArtikel);

module.exports = router;