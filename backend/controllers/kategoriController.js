const KategoriModel = require('../models/kategoriModel');

const getAllKategori = async (req, res, next) => {
  try {
    res.json(await KategoriModel.getAll());
  } catch (err) {
    next(err);
  }
};

const createKategori = async (req, res, next) => {
  try {
    const namaKategori = req.body.nama_kategori?.trim();
    if (!namaKategori) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }

    const id = await KategoriModel.create(namaKategori);
    res.status(201).json({ id_kategori: id, nama_kategori: namaKategori });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Kategori dengan nama ini sudah ada' });
    }
    next(err);
  }
};

const updateKategori = async (req, res, next) => {
  try {
    const namaKategori = req.body.nama_kategori?.trim();
    if (!namaKategori) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }

    const kategori = await KategoriModel.getById(req.params.id);
    if (!kategori) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    const jumlahProduk = await KategoriModel.countProduk(kategori.nama_kategori);
    if (jumlahProduk > 0) {
      return res.status(409).json({
        message: `Kategori tidak bisa diedit karena masih digunakan oleh ${jumlahProduk} produk`,
      });
    }

    const affected = await KategoriModel.update(req.params.id, namaKategori);
    if (!affected) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    res.json({ id_kategori: Number(req.params.id), nama_kategori: namaKategori });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Kategori dengan nama ini sudah ada' });
    }
    next(err);
  }
};

const deleteKategori = async (req, res, next) => {
  try {
    const kategori = await KategoriModel.getById(req.params.id);
    if (!kategori) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    const jumlahProduk = await KategoriModel.countProduk(kategori.nama_kategori);
    if (jumlahProduk > 0) {
      return res.status(409).json({
        message: `Kategori tidak bisa dihapus karena masih digunakan oleh ${jumlahProduk} produk`,
      });
    }

    const affected = await KategoriModel.delete(req.params.id);
    if (!affected) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllKategori, createKategori, updateKategori, deleteKategori };
