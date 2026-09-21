const express = require('express');
const router = express.Router();
const {
  getAllKategori,
  createKategori,
  updateKategori,
  deleteKategori,
} = require('../controllers/kategoriController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, verifyRole('admin'), getAllKategori);
router.post('/', verifyToken, verifyRole('admin'), createKategori);
router.put('/:id', verifyToken, verifyRole('admin'), updateKategori);
router.delete('/:id', verifyToken, verifyRole('admin'), deleteKategori);

module.exports = router;
