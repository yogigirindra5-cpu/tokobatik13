const ProdukModel = require('../models/produkModel');

// Ambil semua produk (bisa difilter lewat query string)
const getAllProduk = async (req, res, next) => {
  try {
    const { kategori, status_produk, search } = req.query;
    const produk = await ProdukModel.getAll({ kategori, status_produk, search });
    res.json(produk);
  } catch (err) {
    next(err);
  }
};

// Ambil detail satu produk
const getProdukById = async (req, res, next) => {
  try {
    const produk = await ProdukModel.getById(req.params.id);
    if (!produk) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json(produk);
  } catch (err) {
    next(err);
  }
};

// Tambah produk baru (khusus admin)
const createProduk = async (req, res, next) => {
  try {
    const {
      nama_produk, deskripsi, harga, stok, ukuran,
      bahan_kain, kategori, status_produk
    } = req.body;

    if (!nama_produk || !deskripsi || !harga) {
      return res.status(400).json({ message: 'Nama, deskripsi, dan harga produk wajib diisi' });
    }

    const gambar = req.file ? req.file.filename : null;
    const statusFinal = Number(stok) > 0 ? 'Tersedia' : 'Habis';

    const id = await ProdukModel.create({
      nama_produk, deskripsi, harga, stok, ukuran,
      bahan_kain, gambar, kategori, status_produk: statusFinal
    });

    res.status(201).json({ message: 'Produk berhasil ditambahkan', id_produk: id });
  } catch (err) {
    next(err);
  }
};

// Update produk (khusus admin)
const updateProduk = async (req, res, next) => {
  try {
    const existing = await ProdukModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const {
      nama_produk, deskripsi, harga, stok, ukuran,
      bahan_kain, kategori, status_produk
    } = req.body;

    const gambar = req.file ? req.file.filename : null;
    const stokBaru = stok !== undefined ? Number(stok) : Number(existing.stok);
    const statusFinal = stokBaru > 0 ? 'Tersedia' : 'Habis';

    await ProdukModel.update(req.params.id, {
      nama_produk: nama_produk || existing.nama_produk,
      deskripsi: deskripsi || existing.deskripsi,
      harga: harga || existing.harga,
      stok: stok !== undefined ? stok : existing.stok,
      ukuran: ukuran || existing.ukuran,
      bahan_kain: bahan_kain || existing.bahan_kain,
      gambar,
      kategori: kategori || existing.kategori,
      status_produk: statusFinal
    });

    res.json({ message: 'Produk berhasil diperbarui' });
  } catch (err) {
    next(err);
  }
};

// Hapus produk (khusus admin)
const deleteProduk = async (req, res, next) => {
  try {
    const affected = await ProdukModel.delete(req.params.id);
    if (!affected) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProduk, getProdukById, createProduk, updateProduk, deleteProduk };