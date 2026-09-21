const ArtikelModel = require('../models/artikelModel');

const getAllArtikel = async (req, res, next) => {
  try {
    const data = await ArtikelModel.getAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getArtikelById = async (req, res, next) => {
  try {
    const artikel = await ArtikelModel.getById(req.params.id);
    if (!artikel) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }
    res.json(artikel);
  } catch (err) {
    next(err);
  }
};

const createArtikel = async (req, res, next) => {
  try {
    const { judul, ringkasan, isi } = req.body;
    if (!judul || !ringkasan || !isi) {
      return res.status(400).json({ message: 'Judul, ringkasan, dan isi wajib diisi' });
    }

    const gambar = req.file ? req.file.filename : null;
    const id = await ArtikelModel.create({ judul, ringkasan, isi, gambar });

    res.status(201).json({ message: 'Artikel berhasil ditambahkan', id });
  } catch (err) {
    next(err);
  }
};

const updateArtikel = async (req, res, next) => {
  try {
    const existing = await ArtikelModel.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    const { judul, ringkasan, isi } = req.body;
    const gambar = req.file ? req.file.filename : null;

    await ArtikelModel.update(req.params.id, {
      judul: judul || existing.judul,
      ringkasan: ringkasan || existing.ringkasan,
      isi: isi || existing.isi,
      gambar
    });

    res.json({ message: 'Artikel berhasil diperbarui' });
  } catch (err) {
    next(err);
  }
};

const deleteArtikel = async (req, res, next) => {
  try {
    const affected = await ArtikelModel.delete(req.params.id);
    if (!affected) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }
    res.json({ message: 'Artikel berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllArtikel, getArtikelById, createArtikel, updateArtikel, deleteArtikel };