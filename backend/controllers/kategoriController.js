const KategoriModel = require("../models/kategoriModel");

// ======================================================
// GET SEMUA KATEGORI
// GET /api/kategori
// ======================================================

async function getAllKategori(req, res) {
  try {
    const kategori = await KategoriModel.getAll();

    return res.status(200).json({
      success: true,
      kategori,
    });
  } catch (error) {
    console.error("GET ALL KATEGORI ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data kategori",
      error: error.message,
    });
  }
}

// ======================================================
// GET KATEGORI BERDASARKAN ID
// GET /api/kategori/:id
// ======================================================

async function getKategoriById(req, res) {
  try {
    const { id } = req.params;

    const kategori = await KategoriModel.getById(id);

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      kategori,
    });
  } catch (error) {
    console.error("GET KATEGORI BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil kategori",
      error: error.message,
    });
  }
}

// ======================================================
// CREATE KATEGORI
// POST /api/kategori
// ======================================================

async function createKategori(req, res) {
  try {
    const { nama_kategori } = req.body;

    // Validasi
    if (
      !nama_kategori ||
      typeof nama_kategori !== "string" ||
      !nama_kategori.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    const namaKategori = nama_kategori.trim();

    const kategori = await KategoriModel.create(
      namaKategori
    );

    return res.status(201).json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      kategori,
    });
  } catch (error) {
    console.error("CREATE KATEGORI ERROR:", error);

    // PostgreSQL UNIQUE violation
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Nama kategori sudah digunakan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan kategori",
      error: error.message,
    });
  }
}

// ======================================================
// UPDATE KATEGORI
// PUT /api/kategori/:id
// ======================================================

async function updateKategori(req, res) {
  try {
    const { id } = req.params;
    const { nama_kategori } = req.body;

    // Validasi
    if (
      !nama_kategori ||
      typeof nama_kategori !== "string" ||
      !nama_kategori.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    const namaKategori = nama_kategori.trim();

    const kategori = await KategoriModel.update(
      id,
      namaKategori
    );

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui",
      kategori,
    });
  } catch (error) {
    console.error("UPDATE KATEGORI ERROR:", error);

    // PostgreSQL UNIQUE violation
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Nama kategori sudah digunakan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui kategori",
      error: error.message,
    });
  }
}

// ======================================================
// DELETE KATEGORI
// DELETE /api/kategori/:id
// ======================================================

async function deleteKategori(req, res) {
  try {
    const { id } = req.params;

    // Ambil kategori terlebih dahulu
    const kategori = await KategoriModel.getById(id);

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Cek apakah kategori masih digunakan produk
    const jumlahProduk =
      await KategoriModel.countProduk(
        kategori.nama_kategori
      );

    if (jumlahProduk > 0) {
      return res.status(400).json({
        success: false,
        message:
          `Kategori tidak dapat dihapus karena masih digunakan oleh ${jumlahProduk} produk`,
      });
    }

    const deleted =
      await KategoriModel.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus",
      kategori: deleted,
    });
  } catch (error) {
    console.error("DELETE KATEGORI ERROR:", error);

    // PostgreSQL foreign key violation
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message:
          "Kategori tidak dapat dihapus karena masih digunakan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori",
      error: error.message,
    });
  }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
};