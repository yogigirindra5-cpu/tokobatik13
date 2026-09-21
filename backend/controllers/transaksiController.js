const TransaksiModel = require('../models/transaksiModel');
const ProdukModel = require('../models/produkModel');
const UserModel = require('../models/userModel');

// Ambil semua transaksi (admin) atau milik sendiri (pembeli)
const getAllTransaksi = async (req, res, next) => {
  try {
    let data;
    if (req.user.role === 'admin') {
      data = await TransaksiModel.getAll();
    } else {
      data = await TransaksiModel.getByPembeli(req.user.id);
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Ambil detail satu transaksi
const getTransaksiById = async (req, res, next) => {
  try {
    const transaksi = await TransaksiModel.getById(req.params.id);
    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    // Pembeli hanya boleh lihat transaksinya sendiri
    if (req.user.role !== 'admin' && transaksi.id_pembeli !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke transaksi ini' });
    }

    res.json(transaksi);
  } catch (err) {
    next(err);
  }
};

// Buat transaksi baru (checkout produk)
const createTransaksi = async (req, res, next) => {
  try {
    const { id_produk, jumlah, metode_pembayaran, catatan } = req.body;

    if (!id_produk || !jumlah) {
      return res.status(400).json({ message: 'Produk dan jumlah wajib diisi' });
    }

    const user = await UserModel.getById(req.user.id);
    if (!user || !user.nama_d || !user.phone || !user.alamat) {
      return res.status(400).json({ message: 'Lengkapi nama, nomor telepon, dan alamat di profil terlebih dahulu' });
    }

    const produk = await ProdukModel.getById(id_produk);
    if (!produk) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    if (produk.status_produk === 'Habis' || produk.stok < jumlah) {
      return res.status(400).json({ message: 'Stok produk tidak mencukupi' });
    }

    const total_harga = produk.harga * jumlah;

    const idTransaksi = await TransaksiModel.create({
      id_pembeli: req.user.id,
      id_produk,
      nama_pembeli: user.nama_d,
      phone_pembeli: user.phone,
      jumlah,
      total_harga,
      metode_pembayaran,
      alamat_kirim: user.alamat,
      catatan
    });

    // Kurangi stok produk setelah transaksi dibuat
    await ProdukModel.updateStok(id_produk, jumlah);

    res.status(201).json({
      message: 'Transaksi berhasil dibuat, silakan lakukan pembayaran',
      id_transaksi: idTransaksi,
      total_harga
    });
  } catch (err) {
    next(err);
  }
};

// Upload bukti pembayaran (pembeli)
const uploadBuktiBayar = async (req, res, next) => {
  try {
    const transaksi = await TransaksiModel.getById(req.params.id);
    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    if (transaksi.id_pembeli !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke transaksi ini' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Bukti pembayaran wajib diunggah' });
    }

    await TransaksiModel.updatePembayaran(req.params.id, 'Dibayar', req.file.filename);
    res.json({ message: 'Bukti pembayaran berhasil diunggah, menunggu verifikasi admin' });
  } catch (err) {
    next(err);
  }
};

// Update status transaksi (khusus admin)
const updateStatusTransaksi = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatus = ['Tertunda', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const affected = await TransaksiModel.updateStatus(req.params.id, status);
    if (!affected) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.json({ message: `Status transaksi berhasil diubah menjadi ${status}` });
  } catch (err) {
    next(err);
  }
};

// Admin: update status pembayaran secara manual (misal setelah cek transfer manual)
const updatePembayaranAdmin = async (req, res, next) => {
  try {
    const { status_bayar } = req.body;
    const validStatusBayar = ['Belum', 'Dibayar'];

    if (!validStatusBayar.includes(status_bayar)) {
      return res.status(400).json({ message: 'Status pembayaran tidak valid' });
    }

    const affected = await TransaksiModel.updatePembayaran(req.params.id, status_bayar, null);
    if (!affected) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.json({ message: `Status pembayaran berhasil diubah menjadi ${status_bayar}` });
  } catch (err) {
    next(err);
  }
};

// Admin: hapus transaksi
const deleteTransaksi = async (req, res, next) => {
  try {
    const affected = await TransaksiModel.delete(req.params.id);
    if (!affected) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTransaksi,
  getTransaksiById,
  createTransaksi,
  uploadBuktiBayar,
  updateStatusTransaksi,
  updatePembayaranAdmin,
  deleteTransaksi
};