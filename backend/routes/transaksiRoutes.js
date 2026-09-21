const express = require('express');
const router = express.Router();
const {
  getAllTransaksi, getTransaksiById, createTransaksi,
  uploadBuktiBayar, updateStatusTransaksi,
  updatePembayaranAdmin, deleteTransaksi
} = require('../controllers/transaksiController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.use(verifyToken);

router.get('/', getAllTransaksi);
router.get('/:id', getTransaksiById);
router.post('/', createTransaksi);
router.patch('/:id/bukti-bayar', upload.single('foto_bukti'), uploadBuktiBayar);
router.patch('/:id/status', verifyRole('admin'), updateStatusTransaksi);
router.patch('/:id/pembayaran', verifyRole('admin'), updatePembayaranAdmin);
router.delete('/:id', verifyRole('admin'), deleteTransaksi);

module.exports = router;